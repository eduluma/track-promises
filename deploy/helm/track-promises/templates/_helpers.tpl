{{/*
Expand the chart name.
*/}}
{{- define "track-promises.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a fully qualified release name.
*/}}
{{- define "track-promises.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Chart label (name + version).
*/}}
{{- define "track-promises.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels.
*/}}
{{- define "track-promises.labels" -}}
helm.sh/chart: {{ include "track-promises.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
{{- end }}

{{/*
Selector labels for web.
*/}}
{{- define "track-promises.web.selectorLabels" -}}
app.kubernetes.io/name: {{ include "track-promises.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: web
{{- end }}

{{/*
Selector labels for api.
*/}}
{{- define "track-promises.api.selectorLabels" -}}
app.kubernetes.io/name: {{ include "track-promises.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: api
{{- end }}

{{/*
Selector labels for postgres.
*/}}
{{- define "track-promises.postgres.selectorLabels" -}}
app.kubernetes.io/name: {{ include "track-promises.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: postgres
{{- end }}

{{/*
Resolved image tag — falls back to global.image.tag.
Usage: {{ include "track-promises.imageTag" (dict "tag" .Values.web.image.tag "global" .Values.global) }}
*/}}
{{- define "track-promises.imageTag" -}}
{{- .tag | default .global.image.tag | default "latest" }}
{{- end }}
