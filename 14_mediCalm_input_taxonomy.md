# MediCalm Input Taxonomy  
  
Status: Draft  
Owner: Josh  
Version: v1  
Purpose: Normalize user-facing and runtime-facing tags used by MediCalm.  
  
## Taxonomy Rules  
  
- Use canonical tags in storage and runtime logic.  
- UI labels may be friendlier, but must map to these canonical tags.  
- Remove duplicates before scoring.  
- Free text is supplemental only in v1.  
  
## Pain Severity  
- `pain_level`: integer 0-10  
- severity bands:  
  - `low`: 0-3  
  - `moderate`: 4-6  
  - `high`: 7-8  
  - `very_high`: 9-10  
  
## Location Tags  
Canonical `location_tags`:  
- `jaw`  
- `ear`  
- `throat`  
- `front_neck`  
- `back_neck`  
- `shoulder`  
- `upper_back`  
- `ribs`  
- `chest`  
- `mid_back`  
- `low_back`  
- `arm`  
- `hand`  
- `hip`  
- `leg`  
- `other`  
  
Example mappings:  
- `tmj` -> `jaw`  
- `ribcage` -> `ribs`  
- `posterior neck` -> `back_neck`  
  
## Symptom Tags  
Canonical `symptom_tags`:  
- `burning`  
- `tightness`  
- `pressure`  
- `soreness`  
- `sharp_pain`  
- `throbbing`  
- `stiffness`  
- `nerve_like`  
- `radiating`  
- `instability`  
- `guarding`  
- `shallow_breathing`  
- `coordination_change`  
- `weakness`  
- `numbness`  
  
Example mappings:  
- `tight` -> `tightness`  
- `tingling` -> `nerve_like`  
- `shooting` -> `radiating`  
  
## Trigger Tags  
Canonical `trigger_tag`:  
- `sitting`  
- `driving`  
- `standing`  
- `after_sleep`  
- `after_stress`  
- `overhead_use`  
- `bracing`  
- `exercise_load`  
- `desk_work`  
- `unknown`  
  
Example mappings:  
- `car` -> `driving`  
- `computer` -> `desk_work`  
  
## Safety Tags  
Canonical `safety_tags`:  
- `chest_pain`  
- `severe_shortness_of_breath`  
- `fainting`  
- `major_balance_loss`  
- `progressive_weakness`  
- `new_weakness`  
- `worsening_numbness`  
- `severe_neurologic_change`  
- `major_hand_dysfunction`  
- `loss_of_coordination`  
- `dizziness`  
- `major_pain_spike`  
- `panic_escalation`  
  
## Result Tags  
- `better`  
- `same`  
- `worse`  
- `interrupted`  
  
## Change Markers  
Canonical `change_markers`:  
- `less_burning`  
- `less_tight`  
- `less_pressure`  
- `less_jaw_tension`  
- `easier_breathing`  
- `more_control`  
- `no_change`  
  
## Runtime Mechanism IDs  
- `MECH_POSTURAL_COMPRESSION`  
- `MECH_RIB_RESTRICTION`  
- `MECH_CERVICAL_GUARDING`  
- `MECH_JAW_CERVICAL_CO_CONTRACTION`  
- `MECH_MECHANICALLY_DRIVEN_NERVE_IRRITATION`  
- `MECH_GENERAL_OVERPROTECTION_STATE`  
  
## Runtime Modes  
- `DIRECT_SESSION_MODE`  
- `GUIDED_FOLLOW_UP_MODE`  
- `SAFETY_STOP_MODE`  
- `INTERRUPTED_CAUTION_MODE`  
  
## Display Modes  
- `breath_only`  
- `breath_with_body_cue`  
- `breath_with_posture_cue`  
- `breath_with_micro_movement`  
- `position_with_breath`  
  
## Provenance Tags  
- `source_grounded`  
- `product_inference`  
- `design_decision`  
- `validation_needed`  
  
## Implementation Notes  
  
- Use these values as enums where possible.  
- Normalize synonyms before execution scoring.  
- Do not add new tags casually without updating this file.  
