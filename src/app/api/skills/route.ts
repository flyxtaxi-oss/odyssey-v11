import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
            return NextResponse.json({
                tracks: [
                    { id: 'track-1', user_id: userId, skill_name: 'Frontend Engineering', current_level: 'Apprentice', progress_percentage: 45 }
                ],
                missions: [
                    { id: 'm-1', skill_track_id: 'track-1', mission_title: 'Build a React Component', description: 'Create a reusable button component with variants.', difficulty: 'Beginner', xp_reward: 50, is_completed: false },
                    { id: 'm-2', skill_track_id: 'track-1', mission_title: 'Master React Hooks', description: 'Learn useEffect and state management.', difficulty: 'Intermediate', xp_reward: 100, is_completed: true }
                ]
            });
        }

        const { data: tracks, error: tracksError } = await supabase
            .from('user_skill_tracks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (tracksError) throw tracksError;

        let missionsData: any[] = [];
        if (tracks && tracks.length > 0) {
            const trackIds = tracks.map(t => t.id);
            const { data: missions, error: missionsError } = await supabase
                .from('skill_missions')
                .select('*')
                .in('skill_track_id', trackIds);

            if (missionsError) throw missionsError;
            missionsData = missions || [];
        }

        return NextResponse.json({
            tracks: tracks || [],
            missions: missionsData
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, ...data } = body;

        if (action === 'create_track') {
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
                const newTrack = {
                    id: 'track-' + Date.now(),
                    user_id: data.user_id,
                    skill_name: data.skill_name,
                    current_level: 'Novice',
                    progress_percentage: 0
                };
                return NextResponse.json({ track: newTrack, message: 'Track created locally' });
            }

            const { data: track, error } = await supabase
                .from('user_skill_tracks')
                .insert([{
                    user_id: data.user_id,
                    skill_name: data.skill_name,
                    current_level: 'Novice',
                    progress_percentage: 0
                }])
                .select()
                .single();

            if (error) throw error;

            const initialMissions = [
                {
                    skill_track_id: track.id,
                    mission_title: `Understand the basics of ${data.skill_name}`,
                    description: `Read an introductory article or watch a video about the core concepts of ${data.skill_name}.`,
                    difficulty: 'Beginner',
                    xp_reward: 50
                },
                {
                    skill_track_id: track.id,
                    mission_title: `Complete the first practical exercise for ${data.skill_name}`,
                    description: `Apply what you've learned in a small, practical scenario.`,
                    difficulty: 'Beginner',
                    xp_reward: 100
                }
            ];

            const { error: missionError } = await supabase
                .from('skill_missions')
                .insert(initialMissions);

            if (missionError) throw missionError;

            return NextResponse.json({ track, message: 'Track and initial missions created' });
        }

        if (action === 'complete_mission') {
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
                return NextResponse.json({ message: 'Mission completed locally', newProgress: 60, newLevel: 'Apprentice' });
            }

            const { data: mission, error: missionError } = await supabase
                .from('skill_missions')
                .update({ is_completed: true })
                .eq('id', data.mission_id)
                .select()
                .single();

            if (missionError) throw missionError;

            const { data: track, error: trackError } = await supabase
                .from('user_skill_tracks')
                .select('*')
                .eq('id', mission.skill_track_id)
                .single();

            if (trackError) throw trackError;

            let newProgress = track.progress_percentage + (mission.xp_reward / 10);
            let newLevel = track.current_level;

            if (newProgress >= 100) {
                newProgress = 0;
                const levels = ['Novice', 'Apprentice', 'Practitioner', 'Expert', 'Master'];
                const currentIndex = levels.indexOf(newLevel);
                if (currentIndex < levels.length - 1) {
                    newLevel = levels[currentIndex + 1];
                }
            }

            const { error: updateError } = await supabase
                .from('user_skill_tracks')
                .update({
                    progress_percentage: newProgress,
                    current_level: newLevel
                })
                .eq('id', track.id);

            if (updateError) throw updateError;

            return NextResponse.json({ message: 'Mission completed', newProgress, newLevel });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
