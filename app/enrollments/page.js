'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ListChecks } from 'lucide-react';

export default function EnrollmentsPage() {
  const { data: session } = useSession();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch('/api/enrollments').then(r=>r.json()).then(d=>{ setEnrollments(Array.isArray(d)?d:[]); setLoading(false); }); }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-6 font-display flex items-center gap-2"><ListChecks className="text-indigo-600"/> Enrollments</h1>
      {loading ? <p className="text-slate-400">Loading...</p> : enrollments.length === 0 ? (
        <div className="text-center py-16 text-slate-400"><ListChecks size={40} className="mx-auto mb-3 opacity-40" /><p className="font-semibold">No enrollments yet</p></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr><th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th><th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course</th><th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th><th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollments.map(e => (
                <tr key={e._id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium text-slate-800">{e.userName || e.userEmail}</td>
                  <td className="px-5 py-4 text-slate-600 max-w-xs"><div className="truncate">{e.courseTitle}</div></td>
                  <td className="px-5 py-4"><div className="flex items-center gap-2"><div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden"><div className="bg-indigo-500 h-2 rounded-full" style={{width: e.progress + '%'}}></div></div><span className="text-xs text-slate-500 w-8">{e.progress}%</span></div></td>
                  <td className="px-5 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}