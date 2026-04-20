# MediCalm Protocol Library  
  
Status: Draft  
Owner: Josh  
Version: v1  
Purpose: Define the first-wave protocol objects available to the runtime engine.  
  
## Protocol Library Rules  
  
- The runtime selects from this library. It does not invent new protocols.  
- Protocols must remain low-risk and calm-first.  
- Protocol wording must stay concise, medically grounded, and non-hyped.  
- Each protocol must carry provenance labels.  
  
## Standard Protocol Object Fields  
  
- `protocol_id`  
- `protocol_name`  
- `goal`  
- `primary_mechanisms`  
- `display_mode`  
- `default_timing_profile`  
- `cue_sequence`  
- `microtext_options`  
- `safe_use_cases`  
- `caution_flags`  
- `stop_conditions`  
- `follow_up_candidates`  
- `provenance_tags`  
- `notes`  
  
## Protocol: Rib Expansion Reset  
  
- `protocol_id`: `PROTO_RIB_EXPANSION_RESET`  
- `protocol_name`: `Rib Expansion Reset`  
- `goal`: Reduce compression and restore rib motion before more specific movement.  
- `primary_mechanisms`: `MECH_RIB_RESTRICTION`, `MECH_POSTURAL_COMPRESSION`, `MECH_GENERAL_OVERPROTECTION_STATE`  
- `display_mode`: `breath_with_body_cue`  
- `default_timing_profile`: inhale 4, exhale 7, rounds 8  
- `cue_sequence`:  
  - `Inhale four. Expand ribs.`  
  - `Exhale seven. Drop shoulders.`  
  - `Jaw loose. Neck soft.`  
- `microtext_options`:  
  - `Let the back ribs widen.`  
  - `Do not force the breath.`  
  - `Use less effort here.`  
- `safe_use_cases`:  
  - broad tightness with shallow breathing  
  - sitting / bracing compression state  
  - jaw and neck tension with rib restriction pattern  
- `caution_flags`: dizziness, worsening nerve symptoms  
- `stop_conditions`: dizziness, major pain spike, severe shortness of breath, worsening numbness, new weakness  
- `follow_up_candidates`: `PROTO_GENTLE_CERVICAL_RECONNECTION`, `PROTO_SEATED_DECOMPRESSION_RESET`  
- `provenance_tags`: `product_inference`, `design_decision`  
- `notes`: preferred calm-first entry protocol when compression or overprotection patterns dominate  
  
## Protocol: Seated Decompression Reset  
  
- `protocol_id`: `PROTO_SEATED_DECOMPRESSION_RESET`  
- `protocol_name`: `Seated Decompression Reset`  
- `goal`: Reduce seated compression and bracing without forcing posture correction.  
- `primary_mechanisms`: `MECH_POSTURAL_COMPRESSION`, `MECH_GENERAL_OVERPROTECTION_STATE`  
- `display_mode`: `breath_with_posture_cue`  
- `default_timing_profile`: inhale 4, exhale 7, rounds 6  
- `cue_sequence`:  
  - `Sit tall. Stay unforced.`  
  - `Expand back ribs on inhale.`  
  - `Exhale slowly. Let bracing drop.`  
- `microtext_options`:  
  - `Do not puff the chest.`  
  - `Keep the jaw quiet.`  
  - `Tall and relaxed.`  
- `safe_use_cases`: seated or car-triggered flare, compression with bracing  
- `caution_flags`: dizziness, worsening arm symptoms  
- `stop_conditions`: major pain spike, new weakness, worsening numbness, severe shortness of breath  
- `follow_up_candidates`: `PROTO_RIB_EXPANSION_RESET`  
- `provenance_tags`: `product_inference`, `design_decision`  
  
## Protocol: Gentle Cervical Reconnection  
  
- `protocol_id`: `PROTO_GENTLE_CERVICAL_RECONNECTION`  
- `protocol_name`: `Gentle Cervical Reconnection`  
- `goal`: Reintroduce low-intensity neck organization after calming and decompression.  
- `primary_mechanisms`: `MECH_CERVICAL_GUARDING`, `MECH_JAW_CERVICAL_CO_CONTRACTION`  
- `display_mode`: `breath_with_micro_movement`  
- `default_timing_profile`: inhale 4, exhale 7, rounds 5  
- `cue_sequence`:  
  - `Inhale four. Stay soft.`  
  - `Exhale seven. Small chin ease.`  
  - `Neck long. No forcing.`  
- `caution_flags`: high pain severity, sharp pain with neck motion, worsening radiating symptoms  
- `stop_conditions`: radiating symptom spike, new weakness, dizziness, worsening numbness  
- `follow_up_candidates`: none by default  
- `provenance_tags`: `product_inference`, `validation_needed`  
  
## Protocol: Jaw Unclench Reset  
  
- `protocol_id`: `PROTO_JAW_UNCLENCH_RESET`  
- `protocol_name`: `Jaw Unclench Reset`  
- `goal`: Reduce jaw guarding when linked to neck tension, bracing, or overprotection.  
- `primary_mechanisms`: `MECH_JAW_CERVICAL_CO_CONTRACTION`, `MECH_GENERAL_OVERPROTECTION_STATE`  
- `display_mode`: `breath_with_soft_release`  
- `default_timing_profile`: inhale 4, exhale 7, rounds 6  
- `cue_sequence`:  
  - `Unclench gently. Teeth stay apart.`  
  - `Exhale slowly. Tongue stays easy.`  
  - `Let neck soften with breath.`  
- `caution_flags`: locking jaw, severe ear pain, acute dental concern  
- `stop_conditions`: sudden worsening jaw instability, sharp escalating pain, new neurologic symptoms  
- `follow_up_candidates`: `PROTO_RIB_EXPANSION_RESET`  
- `provenance_tags`: `product_inference`, `design_decision`  
  
## Protocol: Burning Nerve Calm Reset  
  
- `protocol_id`: `PROTO_BURNING_NERVE_CALM_RESET`  
- `protocol_name`: `Burning Nerve Calm Reset`  
- `goal`: Downshift protection when burning or nerve-like discomfort is prominent.  
- `primary_mechanisms`: `MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION`, `MECH_GENERAL_OVERPROTECTION_STATE`  
- `display_mode`: `breath_only`  
- `default_timing_profile`: inhale 4, exhale 7, rounds 8  
- `cue_sequence`:  
  - `Use less effort right now.`  
  - `Inhale four. Keep shoulders quiet.`  
  - `Exhale seven. Let the body drop.`  
- `caution_flags`: progressive neurologic changes, worsening coordination  
- `stop_conditions`: worsening numbness, new weakness, major pain spike, severe shortness of breath  
- `follow_up_candidates`: `PROTO_RIB_EXPANSION_RESET`  
- `provenance_tags`: `product_inference`, `validation_needed`  
  
## Protocol: Supported Forward Lean Reset  
  
- `protocol_id`: `PROTO_SUPPORTED_FORWARD_LEAN_RESET`  
- `protocol_name`: `Supported Forward Lean Reset`  
- `goal`: Unload the front neck and shift support into the back body.  
- `primary_mechanisms`: `MECH_POSTURAL_COMPRESSION`, `MECH_CERVICAL_GUARDING`, `MECH_RIB_RESTRICTION`  
- `display_mode`: `position_with_breath`  
- `default_timing_profile`: inhale 4, exhale 7, rounds 5  
- `cue_sequence`:  
  - `Lean forward. Support your body.`  
  - `Inhale back ribs into support.`  
  - `Exhale long. Let neck soften.`  
- `caution_flags`: low-back aggravation, dizziness with leaning  
- `stop_conditions`: major pain spike, dizziness, new weakness  
- `follow_up_candidates`: `PROTO_RIB_EXPANSION_RESET`  
- `provenance_tags`: `product_inference`, `design_decision`  
  
## Selection Notes for Claude Code  
  
- Do not treat all protocols as equal starters.  
- Prefer calm-first decompression protocols when pain severity is high.  
- Use the execution spec for scoring and tie-breaks.  
- Do not infer medical efficacy beyond the provenance labels.  
