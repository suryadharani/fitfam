import { FamilyMember, WeighInEntry, NotificationItem, CheckInStatus } from '../types';

/**
 * Determine check-in status for a family member based on latest entry date
 */
export function getMemberCheckInStatus(
  _member: FamilyMember,
  latestEntry?: WeighInEntry | null
): CheckInStatus {
  if (!latestEntry) {
    return 'first-checkin';
  }

  const today = new Date();
  const entryDate = new Date(latestEntry.date);
  
  // Calculate difference in days
  const diffTime = Math.abs(today.getTime() - entryDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 6) {
    return 'checked-in';
  } else if (diffDays <= 9) {
    return 'due';
  } else {
    return 'waiting';
  }
}

/**
 * Evaluate Target Progress dynamically relative to target weight
 */
export function getTargetProgressStatus(
  currentWeightKg: number,
  targetWeightKg?: number | null,
  previousWeightKg?: number | null
): { text: string; cssClass: string; deltaText: string } {
  if (!targetWeightKg) {
    if (!previousWeightKg) {
      return { text: 'Baseline established', cssClass: 'text-muted', deltaText: '—' };
    }
    const diff = Math.round((currentWeightKg - previousWeightKg) * 10) / 10;
    if (Math.abs(diff) < 0.05) {
      return { text: 'Steady weight', cssClass: 'text-muted', deltaText: '→ 0.0 kg' };
    }
    return {
      text: diff < 0 ? 'Weight change' : 'Weight change',
      cssClass: 'text-muted',
      deltaText: diff < 0 ? `↓ ${Math.abs(diff).toFixed(1)} kg` : `↑ ${diff.toFixed(1)} kg`
    };
  }

  const diffToTarget = Math.round((currentWeightKg - targetWeightKg) * 10) / 10;
  const absDiff = Math.abs(diffToTarget).toFixed(1);

  if (Math.abs(diffToTarget) <= 0.3) {
    return {
      text: '🎯 At target baseline!',
      cssClass: 'trend-down', // Positive mint color
      deltaText: `🎯 ${absDiff} kg away`
    };
  }

  if (!previousWeightKg) {
    return {
      text: `${absDiff} kg to target`,
      cssClass: 'text-muted',
      deltaText: `Target: ${targetWeightKg} kg`
    };
  }

  const prevDiffToTarget = Math.abs(previousWeightKg - targetWeightKg);
  const currentDiffToTarget = Math.abs(currentWeightKg - targetWeightKg);

  if (currentDiffToTarget < prevDiffToTarget) {
    return {
      text: '🎯 Moving toward target',
      cssClass: 'trend-down', // Positive mint color
      deltaText: `${absDiff} kg to target`
    };
  } else if (currentDiffToTarget > prevDiffToTarget) {
    return {
      text: 'Moving away from target',
      cssClass: 'trend-up', // Rose warning color
      deltaText: `${absDiff} kg to target`
    };
  } else {
    return {
      text: 'Steady progress toward target',
      cssClass: 'text-muted',
      deltaText: `${absDiff} kg to target`
    };
  }
}

/**
 * Generate in-app notifications dynamically based on real family member data
 */
export function generateNotifications(
  members: FamilyMember[],
  entriesMap: Record<string, WeighInEntry[]>
): NotificationItem[] {
  const notifications: NotificationItem[] = [];
  const todayDateStr = new Date().toISOString().split('T')[0];

  let checkedInTodayCount = 0;
  let totalMembers = members.length;

  members.forEach((m) => {
    const memberEntries = entriesMap[m.id] || [];
    const latest = memberEntries.length > 0 ? memberEntries[0] : null;
    const status = getMemberCheckInStatus(m, latest);

    if (latest && latest.date === todayDateStr) {
      checkedInTodayCount++;
    }

    if (status === 'waiting' || status === 'due') {
      notifications.push({
        id: `reminder-${m.id}`,
        type: 'reminder',
        title: `${m.name}'s weekly check-in`,
        message: `Scheduled for ${m.scheduleDay} at ${m.scheduleTime} · Waiting for entry.`,
        timestamp: 'Waiting',
        memberId: m.id,
        memberName: m.name,
        actionRequired: true,
        category: 'waiting'
      });
    } else if (status === 'first-checkin') {
      notifications.push({
        id: `first-${m.id}`,
        type: 'reminder',
        title: `Welcome ${m.name}`,
        message: `First weekly check-in awaits on ${m.scheduleDay} at ${m.scheduleTime}.`,
        timestamp: 'Pending',
        memberId: m.id,
        memberName: m.name,
        actionRequired: true,
        category: 'today'
      });
    } else if (latest) {
      notifications.push({
        id: `latest-${m.id}`,
        type: 'summary',
        title: `${m.name} checked in`,
        message: `Recorded ${latest.weightKg} kg on ${latest.date}.`,
        timestamp: latest.date,
        memberId: m.id,
        memberName: m.name,
        actionRequired: false,
        category: 'recent'
      });
    }
  });

  if (totalMembers > 0 && checkedInTodayCount > 0) {
    notifications.unshift({
      id: 'today-summary',
      type: 'summary',
      title: 'Family Check-in Activity',
      message: `${checkedInTodayCount} of ${totalMembers} family members checked in today.`,
      timestamp: 'Today',
      actionRequired: false,
      category: 'today'
    });
  }

  return notifications;
}
