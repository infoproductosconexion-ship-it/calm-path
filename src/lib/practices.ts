/**
 * Guided practice content for Calm Path.
 * Structured so real audio can be attached per stage later
 * (each stage already has its own label, text and timing).
 * All copy is on-screen text, calm and non-clinical.
 */

export type PracticeType = 'breathing' | 'meditation' | 'relaxation';

export interface StageContent {
  label: string;
  text: string;
}

export interface GuidedPractice {
  id: string;
  title: string;
  type: PracticeType;
  description: string;
  /** Stages per selected duration in minutes (3, 5, 10, 15). */
  stages: Record<number, StageContent[]>;
}

export const DURATION_OPTIONS = [3, 5, 10, 15] as const;

export const PRACTICES: GuidedPractice[] = [
  {
    id: 'steady-breath',
    title: 'Steady Breath',
    type: 'breathing',
    description: 'A gentle breathing practice to help you slow down and create a little more space in your mind.',
    stages: {
      3: [
        { label: 'Arrive', text: 'Find a comfortable position. Let your hands rest easily. There is nothing else you need to do right now.' },
        { label: 'Notice the breath', text: 'Notice your breathing without trying to change it. Let each breath arrive naturally.' },
        { label: 'Soften the exhale', text: 'As you breathe out, allow your body to settle a little more.' },
        { label: 'Close', text: 'Stay with one more easy breath. You can carry this steadier pace into the next moment.' },
      ],
      5: [
        { label: 'Arrive', text: 'Find a comfortable position. Let your body be supported by the surface beneath you.' },
        { label: 'Notice the breath', text: 'Notice the natural movement of your breathing. There is no need to make it perfect.' },
        { label: 'Gentle rhythm', text: 'Let the inhale arrive gently. Let the exhale leave without effort.' },
        { label: 'Settle', text: 'With each exhale, allow yourself to settle a little more.' },
        { label: 'Close', text: 'Return to your surroundings slowly, taking this quieter rhythm with you.' },
      ],
      10: [
        { label: 'Arrive', text: 'Settle into a comfortable position. For these next few minutes, you can set aside the need to accomplish anything.' },
        { label: 'Notice the breath', text: 'Begin by noticing your breathing as it is. You do not need to force it to become deeper or slower.' },
        { label: 'Gentle rhythm', text: 'Let the inhale arrive. Let the exhale leave. Continue in a way that feels natural for you.' },
        { label: 'Return', text: 'Whenever your attention wanders, gently return to the next breath.' },
        { label: 'Settle', text: 'Allow the breath to become a steady place to rest your attention.' },
        { label: 'Close', text: 'Let your breathing remain easy. Take a moment before returning to your surroundings.' },
      ],
      15: [
        { label: 'Arrive', text: 'Take your time finding a comfortable position. Let the surface beneath you support your body.' },
        { label: 'Notice the breath', text: 'Notice the breath moving in and out. Let it remain natural. There is no need to control it.' },
        { label: 'Gentle rhythm', text: 'Feel the body receiving the inhale. Feel the body releasing with the exhale.' },
        { label: 'Soften', text: 'If it feels comfortable, let the exhale become slightly softer. Continue at your own pace.' },
        { label: 'Return', text: 'Whenever your attention wanders, return gently to the next breath.' },
        { label: 'Settle', text: 'Allow each breath to create a little more space and ease.' },
        { label: 'Close', text: 'There is nothing else you need to accomplish right now. Let the practice come to a gentle close.' },
      ],
    },
  },
  {
    id: 'release-relax',
    title: 'Release & Relax',
    type: 'relaxation',
    description: 'A body-based practice to help you notice tension and invite more ease.',
    stages: {
      3: [
        { label: 'Arrive', text: 'Find a comfortable position and notice the support beneath you.' },
        { label: 'Face', text: 'Soften your forehead, eyes and jaw.' },
        { label: 'Shoulders', text: 'Let your shoulders drop away from your ears.' },
        { label: 'Close', text: 'Allow your body to remain supported as you finish this practice.' },
      ],
      5: [
        { label: 'Arrive', text: 'Let your body be supported by the bed, chair or surface beneath you.' },
        { label: 'Face', text: 'Relax your forehead. Let your eyes and jaw rest.' },
        { label: 'Shoulders and hands', text: 'Let your shoulders release. Soften your hands and fingers.' },
        { label: 'Lower body', text: 'Allow your legs and feet to become comfortable.' },
        { label: 'Close', text: 'You do not need to relax perfectly. Notice any small amount of ease.' },
      ],
      10: [
        { label: 'Arrive', text: 'Settle into a comfortable position and notice where your body is supported.' },
        { label: 'Face and jaw', text: 'Let your forehead soften. Relax the space around your eyes and allow your jaw to loosen.' },
        { label: 'Shoulders and arms', text: 'Let your shoulders drop. Allow your arms, hands and fingers to rest.' },
        { label: 'Chest and stomach', text: 'Let your chest and stomach move naturally with your breathing.' },
        { label: 'Legs and feet', text: 'Allow your hips, legs and feet to feel supported.' },
        { label: 'Close', text: 'Let your whole body become a little more comfortable, one area at a time.' },
      ],
      15: [
        { label: 'Arrive', text: 'Take your time finding a comfortable position. You do not need to hold yourself up or stay alert to every detail.' },
        { label: 'Face and neck', text: 'Soften your forehead, eyes, cheeks and jaw. Let your neck become easy.' },
        { label: 'Shoulders and arms', text: 'Drop your shoulders away from your ears. Allow your arms to feel heavy. Soften your hands and fingers.' },
        { label: 'Torso', text: 'Notice your chest and stomach moving naturally. Let go of any effort you do not need right now.' },
        { label: 'Lower body', text: 'Let your hips and legs be supported. Relax your knees, ankles and feet.' },
        { label: 'Full body', text: 'Allow your whole body to become a little more comfortable, one area at a time.' },
        { label: 'Close', text: 'There is nothing you need to hold tightly right now. Let the practice come to a gentle close.' },
      ],
    },
  },
  {
    id: 'quiet-the-loop',
    title: 'Quiet the Loop',
    type: 'meditation',
    description: 'A gentle practice for creating distance from busy or repetitive thoughts.',
    stages: {
      3: [
        { label: 'Arrive', text: 'Find a comfortable position and notice the next breath.' },
        { label: 'Notice', text: 'Thoughts may appear. You do not need to follow each one.' },
        { label: 'Let go', text: 'Allow each thought to pass without solving it right now.' },
        { label: 'Close', text: 'Return to the next breath and the support beneath you.' },
      ],
      5: [
        { label: 'Arrive', text: 'Settle into a comfortable position. Let your attention rest on your breathing.' },
        { label: 'Notice', text: 'Thoughts may still come and go. That is okay.' },
        { label: 'Create space', text: 'You do not have to push thoughts away or work through them now.' },
        { label: 'Return', text: 'Gently return to the feeling of being supported where you are.' },
        { label: 'Close', text: 'For now, this moment is enough.' },
      ],
      10: [
        { label: 'Arrive', text: 'Settle into a comfortable position and notice the natural rhythm of your breathing.' },
        { label: 'Notice', text: 'You may notice thoughts, plans or memories from the day.' },
        { label: 'Create space', text: 'Imagine each thought moving past like a quiet cloud.' },
        { label: 'Return', text: 'When your attention gets pulled away, gently return to the feeling of being supported.' },
        { label: 'Rest', text: 'The day can wait. This moment is for slowing down.' },
        { label: 'Close', text: 'Let your attention rest here for a few more breaths.' },
      ],
      15: [
        { label: 'Arrive', text: 'Take your time settling into a comfortable position. Allow your body to be supported.' },
        { label: 'Notice', text: 'Thoughts may continue to appear. You do not have to stop them or answer them.' },
        { label: 'Set aside', text: 'Imagine placing each unfinished thought on a shelf for another time.' },
        { label: 'Return', text: 'You can return to it later if it still needs your attention.' },
        { label: 'Rest', text: 'For now, let your attention rest on the quiet feeling of being here.' },
        { label: 'Close', text: 'The day is complete enough for this moment.' },
      ],
    },
  },
  {
    id: 'gentle-unwind',
    title: 'Gentle Unwind',
    type: 'relaxation',
    description: 'A low-effort practice for gradually transitioning from activity toward rest.',
    stages: {
      3: [
        { label: 'Arrive', text: 'Let your body settle into a comfortable position.' },
        { label: 'Soften', text: 'Relax your face and let your shoulders become easy.' },
        { label: 'Breathe', text: 'Allow your breathing to remain natural and unforced.' },
        { label: 'Close', text: 'Stay here for one more quiet moment.' },
      ],
      5: [
        { label: 'Arrive', text: 'Find a comfortable position and let your hands rest naturally.' },
        { label: 'Soften', text: 'Soften your face, jaw and shoulders.' },
        { label: 'Breathe', text: 'Let the inhale arrive and the exhale leave without effort.' },
        { label: 'Release', text: 'Allow your body to become a little heavier and more comfortable.' },
        { label: 'Close', text: 'There is nowhere else you need to be right now.' },
      ],
      10: [
        { label: 'Arrive', text: 'Settle into a comfortable position and allow the surface beneath you to support your body.' },
        { label: 'Soften', text: 'Let your face, shoulders, hands and stomach release unnecessary effort.' },
        { label: 'Breathe', text: 'Notice the natural movement of your breathing.' },
        { label: 'Release', text: 'Allow each exhale to create a little more ease.' },
        { label: 'Rest', text: 'Nothing needs to happen immediately.' },
        { label: 'Close', text: 'Let the practice end gently.' },
      ],
      15: [
        { label: 'Arrive', text: 'Take your time finding a comfortable position. You are allowed to slow down.' },
        { label: 'Soften', text: 'Relax your forehead, eyes, jaw, neck and shoulders.' },
        { label: 'Breathe', text: 'Let your breathing remain natural and easy.' },
        { label: 'Release', text: 'Allow your arms, hands, stomach, legs and feet to become more comfortable.' },
        { label: 'Rest', text: 'You do not need to accomplish anything during this practice.' },
        { label: 'Quiet', text: 'Let there be space between one thought and the next.' },
        { label: 'Close', text: 'Remain here for a few more moments, allowing yourself to rest.' },
      ],
    },
  },
  {
    id: 'drift-into-sleep',
    title: 'Drift Into Sleep',
    type: 'relaxation',
    description: 'A quiet practice to help your body and mind prepare for rest.',
    stages: {
      3: [
        { label: 'Get comfortable', text: 'Find a comfortable position. Let your hands rest easily. There is nothing else you need to do right now.' },
        { label: 'Slow the breath', text: 'Notice your breathing without trying to change it. Let the next breath arrive gently.' },
        { label: 'Relax the body', text: 'Soften your forehead. Let your jaw rest. Drop your shoulders away from your ears.' },
        { label: 'Let the day go', text: 'If thoughts appear, you do not need to solve them now.' },
        { label: 'Rest', text: 'Stay here for a few more moments. Let the practice end gently.' },
      ],
      5: [
        { label: 'Get comfortable', text: 'Find a position that feels comfortable enough for the next few minutes. Let your body be supported.' },
        { label: 'Slow the breath', text: 'Notice the natural movement of your breathing. Let the inhale arrive gently and the exhale leave without effort.' },
        { label: 'Relax the body', text: 'Soften your forehead. Allow your jaw to loosen. Let your shoulders drop.' },
        { label: 'Let the day go', text: 'You do not have to work through every thought now. Imagine placing the unfinished parts of the day somewhere safe.' },
        { label: 'Rest', text: 'Nothing needs to happen immediately. Simply rest here.' },
      ],
      10: [
        { label: 'Get comfortable', text: 'Settle into a comfortable position. Make any small adjustments you need. For these next few minutes, you can set aside the need to accomplish anything.' },
        { label: 'Slow the breath', text: 'Notice your breathing as it is. If it feels comfortable, allow the exhale to become a little softer.' },
        { label: 'Relax the body', text: 'Let your forehead, eyes, jaw, neck and shoulders soften. Allow your arms, hands, legs and feet to feel supported.' },
        { label: 'Let the day go', text: 'Thoughts may appear. Imagine each thought moving past like a quiet cloud.' },
        { label: 'Observation pause', text: 'Notice the temperature of the air, the weight of your body and the natural rhythm of your breath.' },
        { label: 'Rest', text: 'Allow yourself to rest without trying to make sleep happen. Rest is enough for this moment.' },
      ],
      15: [
        { label: 'Get comfortable', text: 'Take your time finding a comfortable position. Let the surface beneath you support your body.' },
        { label: 'Slow the breath', text: 'Notice the breath moving in and out. Let it remain natural. There is no need to control it.' },
        { label: 'Relax the body', text: 'Soften your forehead, eyes, cheeks and jaw. Let your neck and shoulders release.' },
        { label: 'Continue relaxing', text: 'Allow your arms, hands, chest, stomach, hips, legs and feet to become more comfortable.' },
        { label: 'Let the day go', text: 'You do not have to stop your thoughts or answer them. Imagine placing each unfinished thought on a shelf for another time.' },
        { label: 'Observation pause', text: 'Notice the support beneath your body and the movement of your breathing. You do not need to force anything to change.' },
        { label: 'Rest', text: 'You do not need to make sleep happen. Resting, softening and slowing down are enough.' },
        { label: 'Close', text: 'When the session ends, you may continue resting or return slowly to your surroundings.' },
      ],
    },
  },
  {
    id: 'focused-pause',
    title: 'Focused Pause',
    type: 'meditation',
    description: 'A short reset to help you pause and return your attention to the present moment.',
    stages: {
      3: [
        { label: 'Arrive', text: 'Pause where you are and notice your body.' },
        { label: 'Notice', text: 'Feel your feet, hands or the surface supporting you.' },
        { label: 'Breathe', text: 'Take one natural breath and let your shoulders soften.' },
        { label: 'Return', text: 'Choose one small next step when you are ready.' },
      ],
      5: [
        { label: 'Arrive', text: 'Find a comfortable position and allow yourself to pause.' },
        { label: 'Notice', text: 'Notice three simple sensations around you.' },
        { label: 'Breathe', text: 'Let your breathing remain natural and easy.' },
        { label: 'Choose', text: 'Ask yourself what would be most helpful next.' },
        { label: 'Close', text: 'Return to your day at your own pace.' },
      ],
      10: [
        { label: 'Arrive', text: 'Settle into a comfortable position and notice where your body is supported.' },
        { label: 'Senses', text: 'Notice the temperature of the air, the sounds around you and the feeling of the surface beneath you.' },
        { label: 'Breathe', text: 'Follow the natural movement of your breathing for a few moments.' },
        { label: 'Refocus', text: 'Let your attention return gently whenever it wanders.' },
        { label: 'Choose', text: 'Identify one small, manageable next step.' },
        { label: 'Close', text: 'Take that sense of clarity with you.' },
      ],
      15: [
        { label: 'Arrive', text: 'Take your time settling into a comfortable position. There is nothing you need to solve immediately.' },
        { label: 'Senses', text: 'Notice the room around you through sound, temperature, light and physical support.' },
        { label: 'Breathe', text: 'Let your breathing remain natural. Notice each inhale and exhale.' },
        { label: 'Refocus', text: 'Whenever your mind wanders, return gently to one present-moment sensation.' },
        { label: 'Choose', text: 'Consider what deserves your attention next and what can wait.' },
        { label: 'Close', text: 'When you are ready, return slowly to your surroundings.' },
      ],
    },
  },
];

export const PRACTICE_ALIASES: Record<string, string> = {
  'box-breathing': 'steady-breath',
  'box-breathing-reset': 'steady-breath',
  'quiet-mind': 'quiet-the-loop',
  'sleep-ready-relaxation': 'drift-into-sleep',
  'grounding-moment': 'focused-pause',
  'body-scan': 'gentle-unwind',
  'gratitude-meditation': 'quiet-the-loop',
  'muscle-relaxation': 'gentle-unwind',
};

export function getPractice(id: string | undefined): GuidedPractice | undefined {
  if (!id) return undefined;
  const normalized = PRACTICE_ALIASES[id] ?? id;
  return PRACTICES.find((p) => p.id === normalized);
}