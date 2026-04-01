# MediCalm Document Hierarchy Map  
  
Status: Draft  
Owner: Josh  
Version: v1  
Purpose: Define the authoritative reading order, conflict-resolution order, and role of each markdown file in the Claude Code migration pack.  
  
## Core Rule  
  
Claude Code should not treat every file as equal.  
  
These documents are layered intentionally:  
1. source truth and claims boundaries  
2. doctrine and product identity  
3. runtime behavior  
4. guided session presentation  
5. safety override behavior  
6. persistence and history  
7. implementation support materials  
  
When two documents overlap, the more operational document wins over the more descriptive one.  
  
## Recommended File Order  
  
1. `00_mediCalm_document_hierarchy_map.md`  
2. `01_mediCalm_product_vision.md`  
3. `02_mediCalm_source_truth_doctrine.md`  
4. `03_mediCalm_references_source_mapping.md`  
5. `04_mediCalm_knowledge_protocol_doctrine.md`  
6. `05_mediCalm_execution_spec.md`  
7. `06_mediCalm_guided_session_ui_spec.md`  
8. `07_mediCalm_safety_reassurance_spec.md`  
9. `08_mediCalm_visual_design_doctrine.md`  
10. `09_mediCalm_master_architecture.md`  
11. `10_mediCalm_glossary.md`  
12. `11_mediCalm_open_questions_and_validation.md`  
13. `12_mediCalm_ux_ui_experience_report.md`  
14. `13_mediCalm_protocol_library.md`  
15. `14_mediCalm_input_taxonomy.md`  
16. `15_mediCalm_data_schema.md`  
17. `16_mediCalm_copy_system.md`  
18. `17_mediCalm_accessibility_motion_fallbacks.md`  
19. `18_mediCalm_claude_code_system_prompt.md` 
20. `19_mechanism_protocol_mapping.md`
  
## Authority by Domain  
  
### Product Identity  
1. `01_mediCalm_product_vision.md`  
2. `09_mediCalm_master_architecture.md`  
3. `12_mediCalm_ux_ui_experience_report.md`  
  
### Source Truth and Claims Boundaries  
1. `03_mediCalm_references_source_mapping.md`  
2. `02_mediCalm_source_truth_doctrine.md`  
3. `07_mediCalm_safety_reassurance_spec.md`  
  
### Mechanism and Protocol Concepts  
1. `04_mediCalm_knowledge_protocol_doctrine.md`  
2. `13_mediCalm_protocol_library.md`  
3. `19_mechanism_protocol_mapping.md`
4. `14_mediCalm_input_taxonomy.md`  
  
### Runtime Behavior  
1. `05_mediCalm_execution_spec.md`  
2. `09_mediCalm_master_architecture.md`  
3. `04_mediCalm_knowledge_protocol_doctrine.md`  
  
### Guided Session Presentation  
1. `06_mediCalm_guided_session_ui_spec.md`  
2. `12_mediCalm_ux_ui_experience_report.md`  
3. `08_mediCalm_visual_design_doctrine.md`  
  
### Safety, Reassurance, and Escalation  
1. `07_mediCalm_safety_reassurance_spec.md`  
2. `03_mediCalm_references_source_mapping.md`  
3. `02_mediCalm_source_truth_doctrine.md`  
  
### Visual System  
1. `08_mediCalm_visual_design_doctrine.md`  
2. `06_mediCalm_guided_session_ui_spec.md`  
3. `12_mediCalm_ux_ui_experience_report.md`  
  
### Data and Persistence  
1. `15_mediCalm_data_schema.md`  
2. `05_mediCalm_execution_spec.md`  
3. `09_mediCalm_master_architecture.md`  
  
### Language and Copy  
1. `16_mediCalm_copy_system.md`  
2. `07_mediCalm_safety_reassurance_spec.md`  
3. `12_mediCalm_ux_ui_experience_report.md`  
4. `10_mediCalm_glossary.md`  
  
### Accessibility and Motion Alternatives  
1. `17_mediCalm_accessibility_motion_fallbacks.md`  
2. `06_mediCalm_guided_session_ui_spec.md`  
3. `08_mediCalm_visual_design_doctrine.md`  
  
## Conflict Resolution Rule  
  
When two files overlap:  
1. safety and source-boundary files outrank expressive files  
2. runtime files outrank descriptive summaries  
3. specialized files outrank broad files  
4. newer final migration files outrank older draft variants  
5. if uncertainty remains, prefer the lower-risk interpretation  
  
## Claude Code Reading Recommendation  
  
Read in this order:  
1. hierarchy map  
2. product vision  
3. source truth doctrine  
4. references/source mapping  
5. knowledge/protocol doctrine  
6. execution spec  
7. guided session UI spec  
8. safety/reassurance spec  
9. visual design doctrine  
10. master architecture  
11. glossary  
12. open questions/validation  
13. UX/UI experience report  
14. implementation support files  
15. system prompt  
  
## Build Discipline Rule  
  
Build MediCalm as:  
- a bounded symptom-support product  
- not a diagnosis engine  
- not a freeform medical chatbot  
- not a generic meditation app  
- not a luxury wellness experience  
  
It should feel:  
- medically grounded  
- calm  
- low-overload  
- modern  
- luminous  
- conservative when uncertain  
