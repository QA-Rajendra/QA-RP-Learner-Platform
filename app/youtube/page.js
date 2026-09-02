'use client';

import { useState, useEffect } from 'react';
import {
  Video,
  Play,
  Search,
  Sparkles,
  ExternalLink,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';

export default function YouTubeVideosPage() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVideos() {
      try {
        setLoading(true);
        const res = await fetch('/api/youtube');
        const json = await res.json();
        const list = Array.isArray(json) && json.length > 0 ? json : [
          {
            _id: 'v-1',
            title: 'Playwright API Testing Masterclass with JavaScript',
            description: 'Learn how to automate REST APIs with Playwright test runner, validate JSON schemas and auth tokens.',
            youtubeVideoId: 'dQw4w9WgXcQ',
            thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=700&auto=format&fit=crop&q=80',
            duration: '24:15',
            category: 'API Automation'
          },
          {
            _id: 'v-2',
            title: 'Selenium 4 vs Playwright: Complete QA Benchmark',
            description: 'Comprehensive speed, flaky test resilience, and shadow DOM handling comparison between Selenium and Playwright.',
            youtubeVideoId: 'dQw4w9WgXcQ',
            thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&auto=format&fit=crop&q=80',
            duration: '18:50',
            category: 'Web Automation'
          },
          {
            _id: 'v-3',
            title: 'GitHub Actions Matrix Sharding for 10x Faster Tests',
            description: 'Step-by-step setup for parallel test execution across multiple cloud runners in GitHub Actions.',
            youtubeVideoId: 'dQw4w9WgXcQ',
            thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&auto=format&fit=crop&q=80',
            duration: '15:20',
            category: 'DevOps & CI/CD'
          }
        ];
        setVideos(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold uppercase">
            <Video size={15} /> Video Tutorials
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            YouTube QA Tutorials &amp; Workshops
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Watch free step-by-step automation guides, architectural walkthroughs, and live coding sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div
              key={vid._id}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-red-500/40 transition group hover:shadow-2xl hover:shadow-red-950/40"
            >
              <div>
                <div
                  onClick={() => setSelectedVideo(vid)}
                  className="h-48 w-full bg-slate-800 relative cursor-pointer overflow-hidden"
                >
                  <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center group-hover:bg-slate-950/20 transition">
                    <div className="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                      <Play size={22} className="ml-1" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/90 text-white">
                    {vid.duration || '15:00'}
                  </span>
                </div>

                <div className="p-6 space-y-2">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{vid.category}</span>
                  <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug">{vid.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{vid.description}</p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => setSelectedVideo(vid)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Play size={14} /> Watch Tutorial
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Video Player Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-white text-base line-clamp-1">{selectedVideo.title}</h3>
                <button onClick={() => setSelectedVideo(null)} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
                  <X size={18} />
                </button>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeVideoId || 'dQw4w9WgXcQ'}`}
                  title={selectedVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <p className="text-xs text-slate-300">{selectedVideo.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
