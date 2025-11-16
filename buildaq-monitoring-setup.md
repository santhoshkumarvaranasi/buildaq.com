# BuildAQ Platform Monitoring Configuration
# Prometheus, Grafana, and Alerting Setup

## Overview
This document outlines the monitoring, alerting, and observability setup for the BuildAQ multi-domain micro-frontend platform.

## 1. Prometheus Configuration

### 1.1 Main Configuration

```yaml
# monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'buildaq-production'
    environment: 'production'

rule_files:
  - "alert_rules.yml"

scrape_configs:
  # BuildAQ Applications
  - job_name: 'buildaq-shell'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names: ['production', 'staging']
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: buildaq-shell
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__

  - job_name: 'buildaq-schools'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names: ['production', 'staging']
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: buildaq-schools

  - job_name: 'buildaq-backend-apis'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names: ['production', 'staging']
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: 'buildaq-.*-api'
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
        replacement: /metrics

  # Node Exporter
  - job_name: 'node-exporter'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: node-exporter

  # Kubernetes API Server
  - job_name: 'kubernetes-apiservers'
    kubernetes_sd_configs:
      - role: endpoints
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    relabel_configs:
      - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
        action: keep
        regex: default;kubernetes;https

  # Kubernetes Nodes
  - job_name: 'kubernetes-nodes'
    kubernetes_sd_configs:
      - role: node
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    relabel_configs:
      - action: labelmap
        regex: __meta_kubernetes_node_label_(.+)

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager.monitoring.svc.cluster.local:9093

remote_write:
  - url: "https://prometheus-remote-write.buildaq.com/api/v1/write"
    basic_auth:
      username: "buildaq"
      password: "your-remote-write-password"
```

### 1.2 Alert Rules

```yaml
# monitoring/prometheus/alert_rules.yml
groups:
- name: buildaq.rules
  rules:
  # High-level application alerts
  - alert: BuildAQApplicationDown
    expr: up{job=~"buildaq-.*"} == 0
    for: 5m
    labels:
      severity: critical
      team: platform
    annotations:
      summary: "BuildAQ application {{ $labels.job }} is down"
      description: "{{ $labels.job }} has been down for more than 5 minutes"

  - alert: BuildAQHighErrorRate
    expr: rate(http_requests_total{job=~"buildaq-.*",status=~"5.."}[5m]) / rate(http_requests_total{job=~"buildaq-.*"}[5m]) > 0.1
    for: 10m
    labels:
      severity: warning
      team: platform
    annotations:
      summary: "High error rate for {{ $labels.job }}"
      description: "Error rate is {{ $value | humanizePercentage }} for {{ $labels.job }}"

  - alert: BuildAQHighLatency
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=~"buildaq-.*"}[5m])) > 0.5
    for: 10m
    labels:
      severity: warning
      team: platform
    annotations:
      summary: "High latency for {{ $labels.job }}"
      description: "95th percentile latency is {{ $value }}s for {{ $labels.job }}"

  # Infrastructure alerts
  - alert: KubernetesNodeNotReady
    expr: kube_node_status_condition{condition="Ready",status="true"} == 0
    for: 10m
    labels:
      severity: critical
      team: infrastructure
    annotations:
      summary: "Kubernetes node not ready"
      description: "Node {{ $labels.node }} has been not ready for more than 10 minutes"

  - alert: KubernetesPodCrashLooping
    expr: increase(kube_pod_container_status_restarts_total[1h]) > 5
    for: 5m
    labels:
      severity: warning
      team: platform
    annotations:
      summary: "Pod crash looping"
      description: "Pod {{ $labels.namespace }}/{{ $labels.pod }} is crash looping"

  # Resource alerts
  - alert: HighCPUUsage
    expr: 100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 10m
    labels:
      severity: warning
      team: infrastructure
    annotations:
      summary: "High CPU usage"
      description: "CPU usage is above 80% for more than 10 minutes"

  - alert: HighMemoryUsage
    expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 90
    for: 10m
    labels:
      severity: critical
      team: infrastructure
    annotations:
      summary: "High memory usage"
      description: "Memory usage is above 90% for more than 10 minutes"

  # Domain-specific alerts
  - alert: SchoolsServiceDown
    expr: up{job="buildaq-schools-api"} == 0
    for: 3m
    labels:
      severity: critical
      team: schools
      domain: schools
    annotations:
      summary: "Schools service is down"
      description: "The schools microservice has been down for more than 3 minutes"

  - alert: AuthServiceDown
    expr: up{job="buildaq-auth-api"} == 0
    for: 1m
    labels:
      severity: critical
      team: platform
      domain: auth
    annotations:
      summary: "Authentication service is down"
      description: "The authentication service has been down for more than 1 minute"

  # Database alerts
  - alert: DatabaseConnectionPoolExhausted
    expr: buildaq_database_connection_pool_active / buildaq_database_connection_pool_max > 0.9
    for: 5m
    labels:
      severity: warning
      team: platform
    annotations:
      summary: "Database connection pool nearly exhausted"
      description: "Connection pool usage is at {{ $value | humanizePercentage }}"

  # External dependencies
  - alert: ExternalAPIHighLatency
    expr: histogram_quantile(0.95, rate(buildaq_external_api_duration_seconds_bucket[5m])) > 2.0
    for: 5m
    labels:
      severity: warning
      team: platform
    annotations:
      summary: "External API high latency"
      description: "External API {{ $labels.api }} has high latency: {{ $value }}s"
```

## 2. Grafana Dashboards

### 2.1 BuildAQ Platform Overview Dashboard

```json
{
  "dashboard": {
    "id": null,
    "title": "BuildAQ Platform Overview",
    "tags": ["buildaq", "overview"],
    "style": "dark",
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Application Status",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=~\"buildaq-.*\"}",
            "legendFormat": "{{ job }}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "mappings": [
              {
                "type": "value",
                "value": "0",
                "text": "DOWN"
              },
              {
                "type": "value", 
                "value": "1",
                "text": "UP"
              }
            ],
            "thresholds": [
              {
                "color": "red",
                "value": 0
              },
              {
                "color": "green",
                "value": 1
              }
            ]
          }
        }
      },
      {
        "id": 2,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{job=~\"buildaq-.*\"}[5m])) by (job)",
            "legendFormat": "{{ job }}"
          }
        ]
      },
      {
        "id": 3,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{job=~\"buildaq-.*\",status=~\"5..\"}[5m])) by (job)",
            "legendFormat": "{{ job }} errors"
          }
        ]
      },
      {
        "id": 4,
        "title": "Response Times",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket{job=~\"buildaq-.*\"}[5m])) by (le, job))",
            "legendFormat": "{{ job }} p50"
          },
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{job=~\"buildaq-.*\"}[5m])) by (le, job))",
            "legendFormat": "{{ job }} p95"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "10s"
  }
}
```

### 2.2 Domain-Specific Dashboard (Schools)

```json
{
  "dashboard": {
    "title": "Schools Domain Metrics",
    "panels": [
      {
        "title": "Student Registrations",
        "type": "graph",
        "targets": [
          {
            "expr": "increase(buildaq_schools_student_registrations_total[1h])",
            "legendFormat": "Registrations per hour"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "graph", 
        "targets": [
          {
            "expr": "buildaq_schools_active_users",
            "legendFormat": "Active users"
          }
        ]
      },
      {
        "title": "Database Query Performance",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(buildaq_schools_db_query_duration_seconds_bucket[5m]))",
            "legendFormat": "DB query p95"
          }
        ]
      }
    ]
  }
}
```

## 3. Alertmanager Configuration

```yaml
# monitoring/alertmanager/alertmanager.yml
global:
  smtp_smarthost: 'smtp.office365.com:587'
  smtp_from: 'alerts@buildaq.com'
  smtp_auth_username: 'alerts@buildaq.com'
  smtp_auth_password: 'your-email-password'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10m
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
  - match:
      severity: critical
    receiver: 'critical-alerts'
    group_wait: 5s
    group_interval: 5m
    repeat_interval: 30m
  
  - match:
      team: schools
    receiver: 'schools-team'
  
  - match:
      team: platform
    receiver: 'platform-team'

receivers:
- name: 'web.hook'
  webhook_configs:
  - url: 'http://webhook.example.com/'

- name: 'critical-alerts'
  email_configs:
  - to: 'critical@buildaq.com'
    subject: '🚨 CRITICAL: {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      {{ end }}
  
  slack_configs:
  - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
    channel: '#critical-alerts'
    title: '🚨 Critical Alert'
    text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

- name: 'schools-team'
  email_configs:
  - to: 'schools-team@buildaq.com'
    subject: 'Schools Service Alert: {{ .GroupLabels.alertname }}'
  
  slack_configs:
  - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
    channel: '#schools-alerts'

- name: 'platform-team'
  email_configs:
  - to: 'platform-team@buildaq.com'
    subject: 'Platform Alert: {{ .GroupLabels.alertname }}'
  
  slack_configs:
  - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
    channel: '#platform-alerts'

inhibit_rules:
- source_match:
    severity: 'critical'
  target_match:
    severity: 'warning'
  equal: ['alertname', 'cluster', 'service']
```

## 4. Application Metrics Implementation

### 4.1 .NET Core API Metrics

```csharp
// BuildAQ.Shared/Metrics/MetricsExtensions.cs
using Prometheus;

public static class MetricsExtensions
{
    private static readonly Counter RequestsTotal = Metrics
        .CreateCounter("buildaq_http_requests_total", "Total HTTP requests", new[] { "method", "endpoint", "status" });
    
    private static readonly Histogram RequestDuration = Metrics
        .CreateHistogram("buildaq_http_request_duration_seconds", "HTTP request duration", new[] { "method", "endpoint" });
    
    private static readonly Gauge ActiveUsers = Metrics
        .CreateGauge("buildaq_active_users", "Number of active users", new[] { "domain" });
    
    private static readonly Counter BusinessMetrics = Metrics
        .CreateCounter("buildaq_business_events_total", "Business events", new[] { "domain", "event_type" });

    public static void RecordRequest(string method, string endpoint, int statusCode, double duration)
    {
        RequestsTotal.WithLabels(method, endpoint, statusCode.ToString()).Inc();
        RequestDuration.WithLabels(method, endpoint).Observe(duration);
    }

    public static void RecordActiveUsers(string domain, int count)
    {
        ActiveUsers.WithLabels(domain).Set(count);
    }

    public static void RecordBusinessEvent(string domain, string eventType)
    {
        BusinessMetrics.WithLabels(domain, eventType).Inc();
    }
}

// Middleware for automatic request tracking
public class MetricsMiddleware
{
    private readonly RequestDelegate _next;

    public MetricsMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            
            MetricsExtensions.RecordRequest(
                context.Request.Method,
                context.Request.Path,
                context.Response.StatusCode,
                stopwatch.Elapsed.TotalSeconds
            );
        }
    }
}
```

### 4.2 Frontend Application Metrics

```typescript
// libs/shared/monitoring/src/lib/metrics.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private metricsEndpoint = '/api/metrics';

  recordPageView(page: string, domain: string): void {
    this.sendMetric('page_view', { page, domain });
  }

  recordUserAction(action: string, domain: string): void {
    this.sendMetric('user_action', { action, domain });
  }

  recordError(error: Error, component: string): void {
    this.sendMetric('frontend_error', { 
      error: error.message, 
      component,
      stack: error.stack?.substring(0, 500)
    });
  }

  recordPerformance(metric: string, value: number, domain: string): void {
    this.sendMetric('performance', { metric, value, domain });
  }

  private sendMetric(type: string, data: any): void {
    const metric = {
      timestamp: Date.now(),
      type,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Send to backend metrics endpoint
    fetch('/api/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric)
    }).catch(console.error);
  }
}
```

## 5. Log Aggregation

### 5.1 Fluentd Configuration

```yaml
# monitoring/fluentd/fluent.conf
<source>
  @type kubernetes_metadata
  @id kubernetes_metadata
  kubernetes_url "#{ENV['KUBERNETES_SERVICE_HOST']}:#{ENV['KUBERNETES_SERVICE_PORT_HTTPS']}"
  verify_ssl "#{ENV['KUBERNETES_VERIFY_SSL'] || true}"
  ca_file "#{ENV['KUBERNETES_CA_FILE']}"
  bearer_token_file "#{ENV['KUBERNETES_BEARER_TOKEN_FILE']}"
  cache_ttl 3600
</source>

<filter kubernetes.**>
  @type kubernetes_metadata
  kubernetes_url "#{ENV['KUBERNETES_SERVICE_HOST']}:#{ENV['KUBERNETES_SERVICE_PORT_HTTPS']}"
  verify_ssl "#{ENV['KUBERNETES_VERIFY_SSL'] || true}"
  ca_file "#{ENV['KUBERNETES_CA_FILE']}"
  bearer_token_file "#{ENV['KUBERNETES_BEARER_TOKEN_FILE']}"
</filter>

<filter kubernetes.var.log.containers.buildaq-**>
  @type parser
  key_name log
  reserve_data true
  <parse>
    @type json
    time_key timestamp
    time_format %Y-%m-%dT%H:%M:%S.%L%z
  </parse>
</filter>

<match kubernetes.var.log.containers.buildaq-**>
  @type elasticsearch
  host elasticsearch.monitoring.svc.cluster.local
  port 9200
  index_name buildaq-logs
  type_name _doc
  include_tag_key true
  tag_key @log_name
  
  <buffer>
    flush_interval 5s
    chunk_limit_size 2m
    queue_limit_length 32
  </buffer>
</match>
```

## 6. Health Check Implementation

### 6.1 .NET Core Health Checks

```csharp
// BuildAQ.Shared/Health/HealthCheckExtensions.cs
public static class HealthCheckExtensions
{
    public static IServiceCollection AddBuildAQHealthChecks(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHealthChecks()
            .AddCheck("database", () => CheckDatabase(configuration.GetConnectionString("DefaultConnection")))
            .AddCheck("redis", () => CheckRedis(configuration.GetConnectionString("Redis")))
            .AddCheck("external-apis", () => CheckExternalAPIs())
            .AddCheck("disk-space", () => CheckDiskSpace())
            .AddCheck("memory", () => CheckMemoryUsage());

        return services;
    }

    private static HealthCheckResult CheckDatabase(string connectionString)
    {
        try
        {
            using var connection = new SqlConnection(connectionString);
            connection.Open();
            using var command = new SqlCommand("SELECT 1", connection);
            command.ExecuteScalar();
            return HealthCheckResult.Healthy("Database is accessible");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Database is not accessible", ex);
        }
    }

    private static HealthCheckResult CheckRedis(string connectionString)
    {
        try
        {
            var redis = ConnectionMultiplexer.Connect(connectionString);
            var database = redis.GetDatabase();
            database.StringGet("health-check");
            return HealthCheckResult.Healthy("Redis is accessible");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Redis is not accessible", ex);
        }
    }
}
```

## 7. Deployment

### 7.1 Kubernetes Monitoring Stack

```yaml
# monitoring/k8s/monitoring-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: monitoring

---
# Prometheus deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
        - name: data
          mountPath: /prometheus
        command:
          - '/bin/prometheus'
          - '--config.file=/etc/prometheus/prometheus.yml'
          - '--storage.tsdb.path=/prometheus'
          - '--web.console.libraries=/etc/prometheus/console_libraries'
          - '--web.console.templates=/etc/prometheus/consoles'
          - '--storage.tsdb.retention=15d'
          - '--web.enable-lifecycle'
      volumes:
      - name: config
        configMap:
          name: prometheus-config
      - name: data
        persistentVolumeClaim:
          claimName: prometheus-data

---
# Grafana deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
      - name: grafana
        image: grafana/grafana:latest
        ports:
        - containerPort: 3000
        env:
        - name: GF_SECURITY_ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: grafana-secrets
              key: admin-password
        volumeMounts:
        - name: grafana-data
          mountPath: /var/lib/grafana
      volumes:
      - name: grafana-data
        persistentVolumeClaim:
          claimName: grafana-data
```

This comprehensive monitoring setup provides:

1. **Real-time Metrics**: Application performance, infrastructure health, business metrics
2. **Alerting**: Multi-channel notifications for different severity levels
3. **Dashboards**: Visual insights into platform performance
4. **Log Aggregation**: Centralized logging for troubleshooting
5. **Health Checks**: Proactive monitoring of dependencies
6. **Security Monitoring**: Track and alert on security events

The monitoring stack is designed to scale with your multi-domain platform and provide insights specific to each business vertical (schools, hospital, retail, etc.).