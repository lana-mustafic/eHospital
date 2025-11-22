import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LabOrder, LabResult, LabSystemConfig } from '../models/integration.model';

export interface HL7Message {
  messageType: string;
  messageControlId: string;
  timestamp: Date;
  segments: HL7Segment[];
}

export interface HL7Segment {
  segmentId: string;
  fields: string[];
}

export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
  };
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class HL7FHIRService {
  constructor(private http: HttpClient) {}

  // HL7 Message Generation
  generateHL7OrderMessage(order: LabOrder, config: LabSystemConfig): string {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const messageControlId = `ORD${Date.now()}`;
    
    const segments: string[] = [];
    
    // MSH - Message Header
    segments.push(
      `MSH|^~\\&|${config.settings.sendingApplication}|${config.settings.sendingFacility}|` +
      `${config.settings.receivingApplication}|${config.settings.receivingFacility}|` +
      `${timestamp}||ORM^O01^ORM_O01|${messageControlId}|P|${config.settings.hl7Version || '2.5'}`
    );
    
    // PID - Patient Identification
    segments.push(
      `PID|1||${order.patientId}|||Patient Name|||`
    );
    
    // ORC - Common Order
    segments.push(
      `ORC|NW|${order.orderNumber}|||${order.status}|||${order.orderedDate.toISOString()}|` +
      `${order.orderedBy}|||||||||`
    );
    
    // OBR - Observation Request
    order.tests.forEach((test, index) => {
      segments.push(
        `OBR|${index + 1}|${order.orderNumber}|${test.code}|${test.name}|||` +
        `${order.orderedDate.toISOString()}|||||||${test.priority || 'Routine'}|||`
      );
    });
    
    return segments.join('\r');
  }

  parseHL7Message(message: string): HL7Message {
    const lines = message.split(/\r?\n/).filter(l => l.trim());
    const mshSegment = lines[0].split('|');
    
    return {
      messageType: mshSegment[8] || '',
      messageControlId: mshSegment[9] || '',
      timestamp: new Date(),
      segments: lines.map(line => {
        const parts = line.split('|');
        return {
          segmentId: parts[0] || '',
          fields: parts.slice(1)
        };
      })
    };
  }

  // FHIR Resource Generation
  generateFHIRServiceRequest(order: LabOrder): FHIRResource {
    return {
      resourceType: 'ServiceRequest',
      id: order.id,
      status: this.mapOrderStatusToFHIR(order.status),
      intent: 'order',
      code: {
        coding: order.tests.map(test => ({
          system: 'http://loinc.org',
          code: test.code,
          display: test.name
        }))
      },
      subject: {
        reference: `Patient/${order.patientId}`
      },
      requester: {
        reference: `Practitioner/${order.orderedBy}`
      },
      authoredOn: order.orderedDate.toISOString(),
      note: order.notes ? [{ text: order.notes }] : []
    };
  }

  generateFHIRDiagnosticReport(results: LabResult[], orderId: string): FHIRResource {
    return {
      resourceType: 'DiagnosticReport',
      id: `report-${orderId}`,
      status: 'final',
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '58410-2',
          display: 'Comprehensive metabolic panel'
        }]
      },
      subject: {
        reference: `ServiceRequest/${orderId}`
      },
      effectiveDateTime: new Date().toISOString(),
      result: results.map(result => ({
        reference: `Observation/${result.testCode}`
      })),
      conclusion: 'Laboratory results completed'
    };
  }

  generateFHIRObservation(result: LabResult): FHIRResource {
    return {
      resourceType: 'Observation',
      id: result.testCode,
      status: this.mapResultStatusToFHIR(result.status),
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: result.testCode,
          display: result.testName
        }]
      },
      valueQuantity: {
        value: parseFloat(result.value) || 0,
        unit: result.unit || '',
        system: 'http://unitsofmeasure.org',
        code: result.unit || ''
      },
      referenceRange: result.referenceRange ? [{
        text: result.referenceRange
      }] : [],
      effectiveDateTime: result.resultDate.toISOString(),
      performer: result.performedBy ? [{
        reference: `Practitioner/${result.performedBy}`
      }] : []
    };
  }

  // Send HL7/FHIR messages
  sendHL7Message(message: string, config: LabSystemConfig): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(
      '/api/integrations/lab/hl7/send',
      { message, config }
    );
  }

  sendFHIRResource(resource: FHIRResource, config: LabSystemConfig): Observable<{ success: boolean; id?: string }> {
    return this.http.post<{ success: boolean; id?: string }>(
      `/api/integrations/lab/fhir/${resource.resourceType}`,
      resource
    );
  }

  // Receive and parse results
  receiveHL7Results(message: string): LabResult[] {
    const parsed = this.parseHL7Message(message);
    const results: LabResult[] = [];
    
    parsed.segments.forEach(segment => {
      if (segment.segmentId === 'OBX') {
        results.push({
          testCode: segment.fields[2] || '',
          testName: segment.fields[3] || '',
          value: segment.fields[4] || '',
          unit: segment.fields[5] || '',
          referenceRange: segment.fields[6] || '',
          status: 'Final',
          resultDate: new Date()
        });
      }
    });
    
    return results;
  }

  receiveFHIRResults(resource: FHIRResource): LabResult[] {
    if (resource.resourceType === 'DiagnosticReport' && resource['result']) {
      // In a real implementation, you would fetch the Observation resources
      return [];
    }
    return [];
  }

  private mapOrderStatusToFHIR(status: string): string {
    const mapping: { [key: string]: string } = {
      'ORDERED': 'draft',
      'COLLECTED': 'active',
      'IN_PROGRESS': 'active',
      'COMPLETED': 'completed',
      'CANCELLED': 'revoked'
    };
    return mapping[status] || 'draft';
  }

  private mapResultStatusToFHIR(status: string): string {
    const mapping: { [key: string]: string } = {
      'Final': 'final',
      'Preliminary': 'preliminary',
      'Corrected': 'corrected'
    };
    return mapping[status] || 'final';
  }
}

