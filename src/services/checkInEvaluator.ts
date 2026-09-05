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
 * Derives the user-facing member display name adhering to the Nickname + Disambiguation rule.
 * Rule:
 * 1. Primary display name is Nickname (or legacy name if nickname is missing).
 * 2. If 2 or more members share the same nickname (case-insensitive), append (Relationship).
 *    Example: "Ramya (Cousin)" vs "Ramya (Mom)"
 */
export function getMemberDisplayName(
  member: FamilyMember,
  allMembers?: FamilyMember[]
): string {
  const nick = (member.nickname || member.name || 'Member').trim();
  if (!allMembers || allMembers.length <= 1) {
    return nick;
  }

  const lowerNick = nick.toLowerCase();
  const matchingMembers = allMembers.filter((m) => {
    const mNick = (m.nickname || m.name || '').trim().toLowerCase();
    return mNick === lowerNick;
  });

  if (matchingMembers.length > 1) {
    return `${nick} (${member.relationship})`;
  }

  return nick;
}

/**
 * Derives the Full Name of a family member, with fallback to legacy name.
 */
export function getMemberFullName(member: FamilyMember): string {
  return (member.fullName || member.name || 'Member').trim();
}

/**
 * Interface for derived data-driven Family Insights
 */
export interface FamilyInsightsData {
  totalMembers: number;
  checkedInThisWeekCount: number;
  activeJourneysCount: number;
  trend4WeekCount: number;
  targetProgressCount: number;
  membersWithTargetCount: number;
  summarySentence: string;
}

/**
 * Calculates data-driven family insights from real members and entries data
 */
export function getFamilyInsights(
  members: FamilyMember[],
  entriesMap: Record<string, WeighInEntry[]>
): FamilyInsightsData {
  const totalMembers = members.length;
  let checkedInThisWeekCount = 0;
  let activeJourneysCount = 0;
  let trend4WeekCount = 0;
  let targetProgressCount = 0;
  let membersWithTargetCount = 0;

  members.forEach((m) => {
    const memberEntries = entriesMap[m.id] || [];
    const latest = memberEntries.length > 0 ? memberEntries[0] : null;
    const previous = memberEntries.length > 1 ? memberEntries[1] : null;
    const status = getMemberCheckInStatus(m, latest);

    if (status === 'checked-in') {
      checkedInThisWeekCount++;
    }

    if (memberEntries.length >= 1) {
      activeJourneysCount++;
    }

    if (memberEntries.length >= 4) {
      trend4WeekCount++;
    }

    if (m.targetWeightKg) {
      membersWithTargetCount++;
      if (latest) {
        const targetEval = getTargetProgressStatus(latest.weightKg, m.targetWeightKg, previous?.weightKg);
        if (targetEval.cssClass === 'trend-down') {
          targetProgressCount++;
        }
      }
    }
  });

  let summarySentence = "Welcome to your private family home.";

  if (totalMembers === 0) {
    summarySentence = "Add your first family member to begin tracking weekly weigh-ins together.";
  } else if (totalMembers === 1) {
    if (activeJourneysCount === 0) {
      summarySentence = "Your family's journey has started 🌱 1 member registered.";
    } else {
      summarySentence = "Your family's picture is beginning to take shape.";
    }
  } else {
    if (checkedInThisWeekCount === totalMembers) {
      summarySentence = "Everyone is checked in this week. Your family's rhythm is up to date.";
    } else if (checkedInThisWeekCount > 0) {
      const remaining = totalMembers - checkedInThisWeekCount;
      if (targetProgressCount > 0) {
        summarySentence = `${targetProgressCount} family ${targetProgressCount === 1 ? 'member is' : 'members are'} moving toward personal targets. ${remaining} check-in waiting.`;
      } else {
        summarySentence = `${checkedInThisWeekCount} of ${totalMembers} checked in this week. ${remaining} family ${remaining === 1 ? 'check-in is' : 'check-ins are'} still waiting.`;
      }
    } else if (targetProgressCount > 0) {
      summarySentence = `${targetProgressCount} family ${targetProgressCount === 1 ? 'member is' : 'members are'} moving toward personal targets.`;
    } else {
      summarySentence = "Weekly check-ins are scheduled for your family members.";
    }
  }

  return {
    totalMembers,
    checkedInThisWeekCount,
    activeJourneysCount,
    trend4WeekCount,
    targetProgressCount,
    membersWithTargetCount,
    summarySentence
  };
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
    const displayName = getMemberDisplayName(m, members);

    if (latest && latest.date === todayDateStr) {
      checkedInTodayCount++;
    }

    if (status === 'waiting' || status === 'due') {
      notifications.push({
        id: `reminder-${m.id}`,
        type: 'reminder',
        title: `${displayName}'s weekly check-in`,
        message: `Scheduled for ${m.scheduleDay} at ${m.scheduleTime} · Waiting for entry.`,
        timestamp: 'Waiting',
        memberId: m.id,
        memberName: displayName,
        actionRequired: true,
        category: 'waiting'
      });
    } else if (status === 'first-checkin') {
      notifications.push({
        id: `first-${m.id}`,
        type: 'reminder',
        title: `Welcome ${displayName}`,
        message: `First weekly check-in awaits on ${m.scheduleDay} at ${m.scheduleTime}.`,
        timestamp: 'Pending',
        memberId: m.id,
        memberName: displayName,
        actionRequired: true,
        category: 'today'
      });
    } else if (latest) {
      notifications.push({
        id: `latest-${m.id}`,
        type: 'summary',
        title: `${displayName} checked in`,
        message: `Recorded ${latest.weightKg} kg on ${latest.date}.`,
        timestamp: latest.date,
        memberId: m.id,
        memberName: displayName,
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
