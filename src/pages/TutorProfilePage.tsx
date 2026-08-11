import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TutorProfileModal } from '../components/tutor/TutorProfileModal';
import { Tutor, AvailabilitySlot } from '../types';
import { getTutorById } from '../services/profileService';

interface TutorProfilePageProps {
  tutors: Tutor[];
  onBookSession: (tutor: Tutor, slot?: AvailabilitySlot) => void;
}

export const TutorProfilePage: React.FC<TutorProfilePageProps> = ({ tutors, onBookSession }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<Tutor | null>(null);

  useEffect(() => {
    if (!id) return;
    
    // First try the pre-loaded tutors from App state
    const localTutor = tutors.find(t => t.id === id);
    if (localTutor) {
      setTutor(localTutor as any);
      return;
    }

    // Otherwise fetch from API
    getTutorById(id).then(data => {
      if (data) setTutor(data as any);
      else navigate('/tutors', { replace: true });
    });
  }, [id, tutors, navigate]);

  if (!tutor) {
    return <div className="p-8 text-center text-slate-500">Loading profile...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <TutorProfileModal
          tutor={tutor}
          onClose={() => navigate('/tutors')}
          onBookSession={onBookSession}
          isPage={true} // We'll add this prop to remove the modal overlay classes
        />
      </div>
    </div>
  );
};
