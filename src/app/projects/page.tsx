'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects, SavedProject, fetchProjectsFromSupabase } from '@/lib/history';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, Activity, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Load local first
    setProjects(getProjects());
    
    // Sync with Supabase
    if (user?.email) {
      fetchProjectsFromSupabase(user.email).then(data => {
        setProjects(data);
      });
    }
  }, [user?.email]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <button 
        onClick={() => router.push('/')}
        className="flex items-center text-sm text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Повернутися
      </button>

      <h1 className="text-3xl font-bold mb-8">Мої проєкти</h1>

      {projects.length === 0 ? (
        <div className="text-center py-20 text-gray-400 border border-dashed border-gray-700 rounded-[24px]">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">У вас ще немає збережених аналізів.</p>
          <button 
            onClick={() => router.push('/')}
            className="text-brand hover:text-brand/80 mt-2 font-medium"
          >
            Створити перший проєкт
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="cursor-pointer hover:border-brand/50 transition-colors h-full flex flex-col group"
                onClick={() => router.push(`/analyze?id=${project.id}&idea=${encodeURIComponent(project.idea)}`)}
              >
                <CardHeader className="pb-3 flex-none">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl font-bold line-clamp-2">
                      {project.idea}
                    </CardTitle>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(project.createdAt).toLocaleDateString('uk-UA')}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end mt-4">
                  <div className="bg-surface/50 rounded-xl p-3 border border-gray-800 flex justify-between items-center group-hover:bg-surface transition-colors">
                    <div className="flex items-center text-sm text-gray-400">
                      <Activity className="w-4 h-4 mr-2" />
                      Оцінка:
                    </div>
                    <div className={`font-bold ${project.report.color}`}>
                      {project.report.score}/100
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
