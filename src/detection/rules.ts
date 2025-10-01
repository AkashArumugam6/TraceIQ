import { prisma } from '../lib/prisma.js';

export interface DetectionResult {
  shouldCreateAnomaly: boolean;
  severity?: string;
  reason?: string;
}

export interface LogData {
  source: string;
  event: string;
  eventType?: string;
  ip: string;
  user: string;
  timestamp: Date;
}

/**
 * Rule-based anomaly detection engine
 */
export class AnomalyDetectionRules {
  /**
   * Check for brute force login attempts
   * Rule: If eventType = "FAILED_LOGIN", count failed logins for IP in last 10 minutes
   * If count > 5, create HIGH severity anomaly
   */
  static async checkBruteForce(logData: LogData): Promise<DetectionResult> {
    if (logData.eventType !== 'FAILED_LOGIN') {
      return { shouldCreateAnomaly: false };
    }

    try {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      
      const failedLoginCount = await prisma.logEntry.count({
        where: {
          ip: logData.ip,
          eventType: 'FAILED_LOGIN',
          timestamp: {
            gte: tenMinutesAgo
          }
        }
      });

      if (failedLoginCount > 5) {
        return {
          shouldCreateAnomaly: true,
          severity: 'HIGH',
          reason: 'Brute force attempt detected'
        };
      }
    } catch (error) {
      console.error('Error checking brute force rule:', error);
    }

    return { shouldCreateAnomaly: false };
  }

  /**
   * Check for privilege escalation attempts
   * Rule: If eventType contains "sudo" or "root", create MEDIUM severity anomaly
   */
  static async checkPrivilegeEscalation(logData: LogData): Promise<DetectionResult> {
    if (!logData.eventType) {
      return { shouldCreateAnomaly: false };
    }

    const eventTypeLower = logData.eventType.toLowerCase();
    
    if (eventTypeLower.includes('sudo') || eventTypeLower.includes('root')) {
      return {
        shouldCreateAnomaly: true,
        severity: 'MEDIUM',
        reason: 'Privilege escalation detected'
      };
    }

    return { shouldCreateAnomaly: false };
  }

  /**
   * Placeholder for geo anomaly detection
   * Rule: Check for unusual country/geographic location
   */
  static async checkGeoAnomaly(logData: LogData): Promise<DetectionResult> {
    // Placeholder implementation
    // In a real system, this would check against known user locations
    // or use a geolocation service to detect unusual access patterns
    
    // Example: Check if IP is from a known suspicious country
    // This is just a placeholder - implement based on your geo data
    const suspiciousCountries = ['XX', 'YY']; // Placeholder country codes
    
    // For now, return no anomaly
    return { shouldCreateAnomaly: false };
  }

  /**
   * Run all detection rules against a log entry
   * Returns array of anomalies that should be created
   */
  static async detectAnomalies(logData: LogData): Promise<Array<{ severity: string; reason: string }>> {
    const anomalies: Array<{ severity: string; reason: string }> = [];

    try {
      // Run all detection rules
      const [bruteForceResult, privilegeResult, geoResult] = await Promise.all([
        this.checkBruteForce(logData),
        this.checkPrivilegeEscalation(logData),
        this.checkGeoAnomaly(logData)
      ]);

      // Collect anomalies from all rules
      if (bruteForceResult.shouldCreateAnomaly) {
        anomalies.push({
          severity: bruteForceResult.severity!,
          reason: bruteForceResult.reason!
        });
      }

      if (privilegeResult.shouldCreateAnomaly) {
        anomalies.push({
          severity: privilegeResult.severity!,
          reason: privilegeResult.reason!
        });
      }

      if (geoResult.shouldCreateAnomaly) {
        anomalies.push({
          severity: geoResult.severity!,
          reason: geoResult.reason!
        });
      }
    } catch (error) {
      console.error('Error in anomaly detection:', error);
      // Don't throw - let the main flow continue
    }

    return anomalies;
  }
}
