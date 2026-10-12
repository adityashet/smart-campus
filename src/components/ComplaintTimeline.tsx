import React from 'react';
import { TimelineEvent, ComplaintStatus } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { CheckCircle2, Clock, AlertCircle, Wrench, FileCheck, ShieldCheck } from 'lucide-react';

interface ComplaintTimelineProps {
  timeline: TimelineEvent[];
  currentStatus: ComplaintStatus;
}

export function ComplaintTimeline({ timeline, currentStatus }: ComplaintTimelineProps) {
  const allStages: { status: ComplaintStatus; label: string }[] = [
    { status: 'SUBMITTED', label: 'Submitted' },
    { status: 'REVIEWED', label: 'Reviewed' },
    { status: 'ASSIGNED', label: 'Assigned' },
    { status: 'IN_PROGRESS', label: 'In Progress' },
    { status: 'RESOLVED', label: 'Resolved' },
  ];

  const getStageStatus = (stageStatus: ComplaintStatus) => {
    const order = ['SUBMITTED', 'REVIEWED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
    const currentIndex = order.indexOf(currentStatus);
    const stageIndex = order.indexOf(stageStatus);

    if (currentStatus === 'REJECTED') {
      return stageStatus === 'SUBMITTED' ? 'completed' : 'inactive';
    }

    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'active';
    return 'inactive';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">Resolution Progress Timeline</h3>
        <span className="text-xs font-semibold text-slate-500">Live Audit History</span>
      </div>

      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {allStages.map((stage) => {
          const state = getStageStatus(stage.status);
          const matchedEvent = timeline.find((e) => e.status === stage.status);

          return (
            <div key={stage.status} className="relative group">
              {/* Timeline Icon Node */}
              <div
                className={`absolute -left-[30px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white ${
                  state === 'completed'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : state === 'active'
                    ? 'bg-blue-600 text-white ring-blue-100 shadow-sm animate-pulse'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {state === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {state === 'active' && <Clock className="w-3.5 h-3.5" />}
                {state === 'inactive' && <div className="w-2 h-2 rounded-full bg-slate-400" />}
              </div>

              {/* Event Content */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>
                  <h4
                    className={`text-sm font-semibold ${
                      state === 'completed'
                        ? 'text-slate-900 font-bold'
                        : state === 'active'
                        ? 'text-blue-700 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </h4>
                  {matchedEvent ? (
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{matchedEvent.description}</p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-0.5 italic">
                      {state === 'completed' || state === 'active' ? 'Stage initiated' : 'Pending stage'}
                    </p>
                  )}
                </div>

                {matchedEvent && (
                  <div className="sm:text-right shrink-0 mt-1 sm:mt-0">
                    <span className="text-[11px] font-medium text-slate-400 block">
                      {formatDateTime(matchedEvent.timestamp)}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      By {matchedEvent.performedBy} ({matchedEvent.userRole})
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
