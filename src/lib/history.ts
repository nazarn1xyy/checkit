import { Report } from '@/types/report';

export type SavedProject = {
  id: string;
  idea: string;
  report: Report;
  chatMessages?: { role: 'ai' | 'user'; text: string }[];
  createdAt: number;
};

const STORAGE_KEY = 'checkit_history';

export function saveProject(idea: string, report: Report, userEmail?: string): string {
  if (typeof window === 'undefined') return '';
  
  const id = Math.random().toString(36).substring(2, 11);
  const newProject: SavedProject = {
    id,
    idea,
    report,
    chatMessages: [],
    createdAt: Date.now(),
  };

  const existing = getProjects();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newProject, ...existing]));

  // Sync to Supabase in background
  if (userEmail) {
    import('./supabase').then(({ supabase, hasSupabase }) => {
      if (hasSupabase && supabase) {
        supabase.from('projects').insert({
          id,
          user_email: userEmail,
          idea,
          report,
          chat_messages: [],
          created_at: new Date(newProject.createdAt).toISOString()
        }).then(({ error }) => {
          if (error) console.error('Supabase project save error:', error.message);
        });
      }
    });
  }

  return id;
}

export function getProjects(): SavedProject[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function getProjectById(id: string): SavedProject | null {
  const projects = getProjects();
  return projects.find(p => p.id === id) || null;
}

export async function fetchProjectsFromSupabase(userEmail: string): Promise<SavedProject[]> {
  const { supabase, hasSupabase } = await import('./supabase');
  if (!hasSupabase || !supabase) return getProjects();
  
  const { data, error } = await supabase.from('projects')
    .select('*')
    .eq('user_email', userEmail)
    .order('created_at', { ascending: false });
    
  if (error || !data) return getProjects();
  
  const mapped = data.map(d => ({
    id: d.id,
    idea: d.idea,
    report: d.report,
    chatMessages: d.chat_messages || [],
    createdAt: new Date(d.created_at).getTime()
  }));
  
  // Update local cache
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
  }
  
  return mapped;
}

export function updateProjectChat(id: string, messages: any[], userEmail?: string) {
  if (typeof window === 'undefined') return;
  
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index !== -1) {
    projects[index].chatMessages = messages;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }
  
  if (userEmail) {
    import('./supabase').then(({ supabase, hasSupabase }) => {
      if (hasSupabase && supabase) {
        supabase.from('projects').update({ chat_messages: messages }).eq('id', id).then();
      }
    });
  }
}
