{{- define "track-promises.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "track-promises.fullname" -}}
{{- printf "%s-%s" .Release.Name (include "track-promises.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
