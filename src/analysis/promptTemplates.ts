export const SECURITY_ANALYSIS_PROMPT = `
You are a cybersecurity expert analyzing log data for potential threats and anomalies. Analyze the provided logs and identify security issues that may have been missed by rule-based detection.

## Your Task:
1. Identify suspicious patterns, attack vectors, and security threats
2. Explain WHY each anomaly is suspicious with technical details
3. Rate severity: CRITICAL, HIGH, MEDIUM, or LOW
4. Provide specific, actionable remediation steps
5. Look for multi-step attack patterns across different IPs/users
6. Calculate overall risk score (0-100)

## Analysis Guidelines:
- Focus on patterns that indicate real security threats
- Consider timing, frequency, and context of events
- Look for reconnaissance, lateral movement, data exfiltration
- Identify privilege escalation attempts
- Watch for unusual geographic or temporal patterns
- Consider the relationship between different log entries

## Response Format:
Return ONLY valid JSON in this exact format:
{
  "newAnomalies": [
    {
      "ip": "string",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "reason": "brief descriptive title",
      "aiExplanation": "detailed technical explanation of why this is suspicious",
      "recommendedAction": "specific actionable steps to address this threat",
      "confidenceScore": 85
    }
  ],
  "overallRiskScore": 65,
  "threatSummary": "overall security assessment of the log batch",
  "attackPatternsDetected": ["pattern1", "pattern2"]
}

## Log Data:
{LOGS_DATA}

## Existing Anomalies:
{EXISTING_ANOMALIES}

Analyze this data and provide your security assessment in the specified JSON format.
`;

export const MOCK_AI_RESPONSE = {
  newAnomalies: [
    {
      ip: "192.168.1.100",
      severity: "HIGH",
      reason: "Suspicious data exfiltration pattern",
      aiExplanation: "Detected unusual data transfer patterns with large file sizes during off-hours, combined with multiple failed authentication attempts suggesting potential data breach attempt.",
      recommendedAction: "Immediately block this IP, audit data access logs, and check for any unauthorized data transfers.",
      confidenceScore: 87
    }
  ],
  overallRiskScore: 75,
  threatSummary: "High-risk activity detected with potential data exfiltration and brute force attempts. Immediate investigation recommended.",
  attackPatternsDetected: ["Data Exfiltration", "Brute Force", "Off-hours Activity"]
};

