import { ReminderPreference, CourtCase, SupportedLanguage } from '../types';

/**
 * Jurislink Proactive Hearing Reminder & SMS Dispatcher
 * Automatically computes proactive schedules (e.g. 7 days before, 3 days before, 1 day before, day-of).
 * Handles date changes and adjournments gracefully: auto-invalidates old scheduled alerts and sends "Hearing Rescheduled" notifications.
 */

export class ReminderService {
  private static STORAGE_KEY = 'jurislink_reminder_preferences';

  static getPreferences(): ReminderPreference[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static savePreference(pref: ReminderPreference) {
    if (typeof window === 'undefined') return;
    const existing = this.getPreferences().filter(p => p.cnr !== pref.cnr);
    existing.push(pref);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing));
  }

  static removePreference(cnr: string) {
    if (typeof window === 'undefined') return;
    const existing = this.getPreferences().filter(p => p.cnr !== cnr);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing));
  }

  /**
   * Schedule or update proactive reminders for a case
   */
  static setupRemindersForCase(
    caseData: CourtCase,
    phoneNumber: string,
    language: SupportedLanguage = 'hi',
    remindDaysBefore: number[] = [7, 3, 1, 0]
  ): ReminderPreference {
    const hearingDateStr = caseData.accessibilitySummary.whenDate;
    const scheduledReminders: ReminderPreference['scheduledReminders'] = [];

    // Parse hearing date if valid YYYY-MM-DD
    const dateMatch = hearingDateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateMatch) {
      const hearingDate = new Date(hearingDateStr);

      for (const daysBefore of remindDaysBefore) {
        const triggerDate = new Date(hearingDate);
        triggerDate.setDate(triggerDate.getDate() - daysBefore);

        const smsContent = this.generateRegionalSms(caseData, language, daysBefore);

        scheduledReminders.push({
          scheduledDate: triggerDate.toISOString().split('T')[0],
          type: 'HEARING_REMINDER',
          status: 'PENDING',
          smsContent
        });
      }
    }

    const pref: ReminderPreference = {
      id: `REM-${caseData.cnr}-${Date.now().toString(36)}`,
      cnr: caseData.cnr,
      caseNumber: caseData.caseNumber,
      phoneNumber,
      language,
      enabledChannels: ['SMS'],
      remindDaysBefore,
      scheduledReminders
    };

    this.savePreference(pref);
    return pref;
  }

  /**
   * Detect Adjournment / Hearing Date Change
   * Cancels old stale pending reminders and schedules a new "Reschedule Alert"
   */
  static handleHearingDateRescheduled(
    oldPreference: ReminderPreference,
    caseData: CourtCase,
    newDateStr: string
  ): ReminderPreference {
    // Invalidate old pending reminders
    const updatedReminders: ReminderPreference['scheduledReminders'] = oldPreference.scheduledReminders.map(r => ({
      ...r,
      status: (r.status === 'PENDING' ? 'CANCELLED' : r.status) as 'PENDING' | 'SENT' | 'CANCELLED'
    }));

    // Add Rescheduled Alert SMS
    const alertSms = this.generateRescheduleSms(caseData, oldPreference.language, newDateStr);
    updatedReminders.push({
      scheduledDate: new Date().toISOString().split('T')[0],
      type: 'RESCHEDULE_ALERT',
      status: 'PENDING',
      smsContent: alertSms
    });

    const updatedPref: ReminderPreference = {
      ...oldPreference,
      scheduledReminders: updatedReminders
    };

    this.savePreference(updatedPref);
    return updatedPref;
  }

  /**
   * Generate Plain Regional Language SMS (Low Literacy Friendly)
   */
  static generateRegionalSms(caseData: CourtCase, lang: SupportedLanguage, daysBefore: number): string {
    const caseNum = caseData.caseNumber;
    const court = caseData.courtName;
    const date = caseData.accessibilitySummary.whenDate;
    const time = caseData.accessibilitySummary.whenTime || '10:30 AM';
    const room = caseData.courtRoomNumber || 'Court Room';

    if (lang === 'hi') {
      const dayWord = daysBefore === 0 ? 'आज' : (daysBefore === 1 ? 'कल' : `${daysBefore} दिनों में`);
      return `[जूरिसलिंक अलर्ट] केस ${caseNum} की सुनवाई ${dayWord} (${date}) को ${time} बजे ${room}, ${court} में है। अपने वकील से संपर्क रखें। कॉल: 1800-JURIS-LINK`;
    }
    if (lang === 'ta') {
      const dayWord = daysBefore === 0 ? 'இன்று' : (daysBefore === 1 ? 'நாளை' : `${daysBefore} நாட்களில்`);
      return `[ஜூரிஸ்லிங்க்] வழக்கு ${caseNum} விசாரணை ${dayWord} (${date}) அன்று ${time} மணிக்கு ${room}, ${court}-ல் நடைபெறுகிறது. உதவிக்கு: 1800-JURIS-LINK`;
    }
    if (lang === 'te') {
      const dayWord = daysBefore === 0 ? 'ఈరోజు' : (daysBefore === 1 ? 'రేపు' : `${daysBefore} రోజుల్లో`);
      return `[జ్యూరిస్‌లింక్] కేసు ${caseNum} విచారణ ${dayWord} (${date})న ${time} గంటలకు ${room}, ${court} లో జరుగుతుంది. హెల్ప్‌లైన్: 1800-JURIS-LINK`;
    }
    const dayWord = daysBefore === 0 ? 'Today' : (daysBefore === 1 ? 'Tomorrow' : `in ${daysBefore} days`);
    return `[Jurislink Alert] Hearing for Case ${caseNum} is ${dayWord} on ${date} at ${time} in ${room}, ${court}. Helpline: 1800-JURIS-LINK`;
  }

  /**
   * Generate Reschedule Alert SMS
   */
  static generateRescheduleSms(caseData: CourtCase, lang: SupportedLanguage, newDate: string): string {
    const caseNum = caseData.caseNumber;
    if (lang === 'hi') {
      return `[जूरिसलिंक सूचना] केस ${caseNum} की सुनवाई की तारीख बदल गई है। नई तारीख: ${newDate}। स्थान: ${caseData.courtName}। विवरण: 1800-JURIS-LINK`;
    }
    if (lang === 'ta') {
      return `[ஜூரிஸ்லிங்க் அறிவிப்பு] வழக்கு ${caseNum} விசாரணை தேதி மாற்றப்பட்டுள்ளது. புதிய தேதி: ${newDate}. நீதிமன்றம்: ${caseData.courtName}.`;
    }
    return `[Jurislink Notice] Hearing date for Case ${caseNum} has changed. New date: ${newDate} at ${caseData.courtName}.`;
  }
}
