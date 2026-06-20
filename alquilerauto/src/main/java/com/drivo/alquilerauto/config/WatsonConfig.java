package com.drivo.alquilerauto.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.watson")
public class WatsonConfig {
    private String apiKey = "";
    private String url = "";
    private String assistantId = "";
    private boolean offline = true;

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank()
            && url != null && !url.isBlank();
    }

    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; this.offline = !isConfigured(); }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; this.offline = !isConfigured(); }
    public String getAssistantId() { return assistantId; }
    public void setAssistantId(String assistantId) { this.assistantId = assistantId; }
    public boolean isOffline() { return offline || !isConfigured(); }
}
