import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yldkfswjujvmfnsuczhv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZGtmc3dqdWp2bWZuc3Vjemh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTU1NjYsImV4cCI6MjEwMTkzMTU2Nn0.Y7Ez88t6cRhaAoXU3M8zmr3MYosTu5lqIUt75s5xtz0'
);

async function main() {
  const { data: users, error: err1 } = await supabase.from('User').select('*');
  console.log("Users:", users?.length, err1);

  const { data: tutors, error: err2 } = await supabase.from('TutorProfile').select('*');
  console.log("Tutors:", tutors?.length, err2);
  
  if (tutors) {
    for (const t of tutors) {
      console.log(" - Tutor:", t.id, t.verificationStatus, t.userId);
    }
  }
}

main().catch(console.error);
