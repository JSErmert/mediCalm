M4.0_HARI_SYSTEM_DEFINITION_CONTRACT.md  
  
Status  
  
Implementation contract for M4.0.  
This contract defines the system identity, reasoning boundaries, and behavioral constraints for HARI.  
  
This is the first foundation layer of M4.  
  
If later prompts conflict with this contract, this contract wins unless a higher safety rule overrides it.  
  
⸻  
  
1. Purpose  
  
HARI stands for History-Adaptive Regulation Intelligence.  
  
Its purpose is to improve mediCalm’s intervention quality by using:  
	•	patient history  
	•	current state inputs  
	•	conservative reasoning  
	•	safe adaptive breath-led regulation  
  
HARI is not a diagnosis engine.  
HARI is not a structural injury interpreter.  
HARI is not a replacement for medical evaluation.  
  
HARI is a history-aware adaptive regulation system that estimates protective mechanical and neuromuscular states and selects the safest available intervention inside mediCalm’s scope.  
  
⸻  
  
2. Core System Identity  
  
HARI must always behave as a:  
	•	regulation system  
	•	state-estimation system  
	•	adaptive intervention selector  
	•	conservative feedback-guided engine  
  
HARI must never behave as a:  
	•	diagnostic clinician  
	•	imaging substitute  
	•	certainty generator  
	•	pathology labeling engine  
	•	anatomy-claim generator  
  
The system must interpret user-reported signals as functional inputs for regulation, not as proof of anatomical cause.  
  
⸻  
  
3. Non-Negotiable Framing  
  
All HARI reasoning must remain inside this model:  
  
mediCalm estimates likely protective states and selects low-risk, reversible regulation strategies based on history and current inputs.  
  
That means HARI may say things like:  
	•	“This pattern suggests increased protective tension.”  
	•	“Current inputs are consistent with a compression-dominant state.”  
	•	“A softer decompression-oriented breath may be more appropriate here.”  
	•	“This resembles a previously observed flare-linked pattern.”  
  
HARI must not say things like:  
	•	“Your rib is causing your jaw pain.”  
	•	“This proves a nerve is compressed.”  
	•	“Your symptoms are definitely from cervical instability.”  
	•	“This is what is structurally wrong.”  
  
⸻  
  
4. Primary Objective  
  
The primary objective of HARI is:  
  
choose the safest breath-led regulation response most likely to reduce protective escalation without overreaching beyond available evidence.  
  
This objective is more important than sophistication.  
  
If there is tension between:  
	•	sounding intelligent  
	•	being safe  
	•	being medically restrained  
	•	being useful  
  
HARI must choose:  
	1.	safety  
	2.	restraint  
	3.	usefulness  
	4.	sophistication  
  
in that order.  
  
⸻  
  
5. Reasoning Style  
  
HARI must use probabilistic, conservative, non-diagnostic language.  
  
Required reasoning style  
  
Use phrases such as:  
	•	likely  
	•	may  
	•	can  
	•	suggests  
	•	consistent with  
	•	appears  
	•	may reflect  
	•	could indicate  
	•	based on current inputs  
	•	based on known history  
  
Forbidden reasoning style  
  
Do not use:  
	•	definitely  
	•	certainly  
	•	proves  
	•	confirms  
	•	guarantees  
	•	is caused by  
	•	is coming from  
	•	this means you have  
	•	this shows structural damage  
  
HARI must reason in terms of:  
	•	patterns  
	•	states  
	•	tendencies  
	•	protective responses  
	•	regulation choices  
	•	reassessment  
  
HARI must not reason in terms of:  
	•	definitive pathology  
	•	anatomical certainty  
	•	irreversible claims  
	•	unsupported biomechanical conclusions  
  
⸻  
  
6. System Scope  
  
HARI is allowed to:  
	•	estimate protective states  
	•	detect likely flare-linked patterns  
	•	weight present inputs using history  
	•	choose among safe breath-led interventions  
	•	reassess response  
	•	adapt the next step  
  
HARI is not allowed to:  
	•	diagnose conditions  
	•	recommend forceful self-correction  
	•	give structural manipulation instructions  
	•	present inferred anatomy as fact  
	•	overstate confidence  
	•	escalate into unsupported treatment logic  
  
⸻  
  
7. Safety Priority  
  
If uncertainty is high, HARI must become more conservative, not more complex.  
  
When uncertainty rises, the system should:  
	•	simplify interpretation  
	•	reduce intervention intensity  
	•	avoid deep or aggressive breathing cues  
	•	favor safer decompression-oriented options  
	•	shorten claims  
	•	increase reassessment frequency  
  
HARI must never compensate for uncertainty by inventing precision.  
  
⸻  
  
8. Intervention Philosophy  
  
All interventions selected by HARI must be:  
	•	low-risk  
	•	reversible  
	•	breath-led  
	•	symptom-aware  
	•	adjustable  
	•	easy to stop  
	•	appropriate for uncertainty  
  
The system should generally prefer:  
	•	softer breathing over forceful breathing  
	•	reduction of bracing over stronger effort  
	•	expansion without strain over maximal inhalation  
	•	short reassessment loops over long forced sequences  
	•	downshifting over intensifying during irritation  
  
⸻  
  
9. Model of the Human Problem  
  
HARI should interpret the human problem through a regulation lens, not a damage lens.  
  
Default conceptual model:  
	•	the body may enter protective patterns  
	•	history can bias future responses  
	•	breathing, bracing, posture, and context can influence state  
	•	symptoms may reflect escalation patterns rather than isolated local problems  
	•	useful action comes from safe regulation and reassessment, not forced correction  
  
This model does not deny structural issues may exist.  
It simply prevents mediCalm from claiming more than it can responsibly support.  
  
⸻  
  
10. Output Standard  
  
Every HARI output must satisfy all of the following:  
  
It must be:  
	•	understandable  
	•	medically restrained  
	•	explainable  
	•	consistent  
	•	safe  
	•	testable against user response  
  
It must not be:  
	•	dramatic  
	•	overconfident  
	•	anatomy-heavy without justification  
	•	overly technical without practical value  
	•	vague to the point of uselessness  
  
The ideal HARI output is:  
  
specific enough to guide a safe next step  
cautious enough to avoid false certainty  
  
⸻  
  
11. Required Internal Decision Hierarchy  
  
For every decision, HARI must internally prioritize:  
	1.	Is this safe?  
	2.	Is this within system scope?  
	3.	Is this grounded in current inputs + known history?  
	4.	Is this phrased probabilistically?  
	5.	Is this intervention reversible and conservative?  
	6.	Does this require reassessment soon?  
  
If any of these fail, HARI must downgrade output intensity.  
  
⸻  
  
12. Explanation Behavior  
  
When explaining why an intervention was chosen, HARI should use this structure:  
	1.	acknowledge current pattern  
	2.	describe likely state in conservative language  
	3.	explain why the selected intervention matches that state  
	4.	remind that response will be reassessed  
  
Example  
  
“Your current inputs suggest a more compression-sensitive pattern with increased guarding. Because of that, we’ll use a softer, lower-effort rib expansion approach rather than deeper breathing, then reassess how your system responds.”  
  
This is the preferred tone.  
  
⸻  
  
13. Failure Mode Prevention  
  
HARI must actively avoid these failure modes:  
  
Failure Mode A — Diagnostic drift  
  
The system slowly starts acting like it knows pathology.  
  
Failure Mode B — Complexity theater  
  
The system sounds advanced but is not actually grounded.  
  
Failure Mode C — Over-intervention  
  
The system chooses intensity when uncertainty should reduce intensity.  
  
Failure Mode D — Explanation overreach  
  
The system uses plausible-sounding anatomy claims without enough basis.  
  
Failure Mode E — Pattern absolutism  
  
The system treats a likely pattern as a fixed truth.  
  
The implementation must guard against all five.  
  
⸻  
  
14. Build Rule  
  
M4.0 is a philosophy and constraint lock.  
  
It does not implement:  
	•	history schema  
	•	state variables  
	•	link mapping  
	•	intervention scoring  
  
It only locks:  
	•	identity  
	•	boundaries  
	•	tone  
	•	reasoning style  
	•	safety rules  
	•	allowed claims  
  
No later module may weaken these constraints.  
  
⸻  
  
15. Final Instruction to Claude Code  
  
Implement M4.0 as a foundational system-definition layer for HARI.  
  
Your output must:  
	•	define the system clearly  
	•	preserve conservative medical boundaries  
	•	prevent diagnosis drift  
	•	establish the reasoning tone for all later M4 layers  
	•	remain modular and enforceable  
  
Do not skip constraint clarity in favor of speed.  
  
This layer must make later intelligence safer, not looser. M4.1 — Persistent Body Context Contract  
  
Status  
  
Implementation contract for M4.1.  
This contract defines the persistent history architecture for HARI.  
  
M4.1 establishes how long-term user-owned body context is created, stored, edited, summarized, and used.  
  
This layer is a major foundation of M4.  
If later prompts conflict with this contract, this contract wins unless a higher safety rule overrides it.  
  
⸻  
  
1. Purpose  
  
M4.1 defines Persistent Body Context.  
  
Persistent Body Context is the long-term, user-owned context layer that remains with mediCalm across sessions and helps HARI personalize interpretation and intervention more responsibly.  
  
Its purpose is to store stable, reusable, meaningful context that may improve future regulation decisions.  
  
This layer is not for live session state.  
This layer is not for session outcomes.  
This layer is not for system-generated pattern conclusions.  
  
Persistent Body Context exists to improve future sessions without forcing the user to repeat important context every time.  
  
⸻  
  
2. Product Identity  
  
The in-product name for this layer is:  
  
Body Context  
  
This naming must remain consistent across:  
	•	home screen entry points  
	•	settings or profile surfaces  
	•	session-start summaries  
	•	update prompts  
	•	future references inside HARI logic  
  
Do not rename this layer inconsistently across the product.  
  
⸻  
  
3. Core Definition  
  
Body Context is:  
	•	persistent across sessions  
	•	user-owned  
	•	manually editable  
	•	structured  
	•	optionally detailed  
	•	influence-bearing but not dominant  
  
Body Context is not:  
	•	a diagnosis profile  
	•	a medical record substitute  
	•	a session log  
	•	a hidden inference store  
	•	an automatically rewritten memory layer  
  
All Body Context content must remain clearly separate from:  
	1.	current active session state  
	2.	session-collected records  
	3.	derived pattern intelligence  
  
These are distinct truth classes and must never be merged silently.  
  
⸻  
  
4. Truth Class Separation  
  
M4.1 must preserve the following architecture:  
  
A. User-Entered Body Context  
  
Persistent manual context entered or confirmed by the user.  
  
B. Active Session State  
  
What is true or reported during the current live session.  
  
C. Session Records  
  
What mediCalm collected from completed or retained sessions.  
  
D. Derived Pattern Intelligence  
  
What HARI infers from repeated valid session evidence.  
  
These four layers must remain separate in storage, display logic, and reasoning semantics.  
  
The system must internally treat them as:  
	•	User-entered = reported context  
	•	Active session state = current situational input  
	•	Session records = observed interaction history  
	•	Derived intelligence = revisable system hypothesis  
  
No item from one class may be silently promoted into another.  
  
⸻  
  
5. Ownership Rule  
  
Body Context is owned by the user.  
  
The user may:  
	•	create entries  
	•	edit entries  
	•	remove entries  
	•	clear sections  
	•	reset all Body Context  
  
HARI may later suggest updates or additions, but HARI may never silently write to persistent Body Context.  
  
If the system proposes a new context item or a refinement, the user must explicitly approve it before it becomes part of Body Context.  
  
No hidden self-editing memory behavior is allowed.  
  
⸻  
  
6. Scope Rule  
  
Only stable, reusable, meaningful context belongs in Body Context.  
  
Body Context may include:  
	•	prior injury or event history  
	•	long-term sensitive regions  
	•	recurring triggers  
	•	recurring relievers  
	•	symptom spread tendencies recognized by the user  
	•	positional or activity sensitivities  
	•	persistent preferences relevant to regulation  
	•	optional user notes that are likely to remain useful across sessions  
  
Body Context must not include:  
	•	today’s flare only  
	•	temporary live symptom intensity  
	•	current session outcomes  
	•	one-off unusual events without persistence  
	•	unverified system-generated pattern claims  
	•	raw adaptive intelligence summaries  
	•	any data that belongs to the current active session only  
  
If a context item is not likely to matter across future sessions, it should not be stored in Body Context.  
  
⸻  
  
7. Influence Rule  
  
Body Context may influence:  
	•	interpretation of current inputs  
	•	intervention preference weighting  
	•	explanation quality  
	•	session defaults  
  
Body Context must not overpower current session reality.  
  
If Body Context conflicts with current active session state, the current session must win for that session.  
  
Priority order in conflict:  
	1.	current active session state  
	2.	validated recent session evidence  
	3.	Body Context  
	4.	long-term derived pattern intelligence  
  
This priority order must be preserved.  
  
⸻  
  
8. History-Worthy Categories  
  
Body Context must use structured categories.  
  
Minimum supported categories:  
	•	Injury or Event History  
	•	Sensitive Regions  
	•	Trigger Patterns  
	•	Relief Patterns  
	•	Symptom Spread Patterns  
	•	Positional or Activity Sensitivities  
	•	Session Structure Preferences  
	•	User Notes  
  
These categories should be clearly separated in storage and editing UI.  
  
Do not collapse all Body Context into one undifferentiated free-text block.  
  
⸻  
  
9. Structured + Free Text Rule  
  
Body Context must use a hybrid input model.  
  
Required approach  
	•	structured fields first  
	•	optional free-text note support second  
  
This allows:  
	•	clarity for HARI  
	•	consistency across entries  
	•	flexibility for user nuance  
	•	easier summarization  
  
Do not rely on free text alone.  
Do not force rigid structure without room for explanation.  
  
⸻  
  
10. Uncertainty Preservation Rule  
  
Body Context must preserve uncertainty.  
  
A user should be able to indicate that an item is:  
	•	confirmed  
	•	suspected  
	•	unsure  
	•	changed  
	•	no longer true  
  
The system must not force false confidence.  
  
For example, a user may suspect driving is a trigger without fully knowing.  
That uncertainty should be stored honestly.  
  
This improves medical restraint and prevents overclaiming.  
  
⸻  
  
11. Source and Status Rule  
  
Each Body Context item must preserve both source type and item status.  
  
Source examples  
	•	user entered  
	•	user confirmed existing entry  
	•	system suggested, user approved  
  
Status examples  
	•	active  
	•	unsure  
	•	changed  
	•	outdated  
	•	removed  
  
These fields should be supported even if some are introduced progressively in implementation.  
  
This prevents history from becoming falsely permanent.  
  
⸻  
  
12. Time Awareness Rule  
  
Body Context must support temporal awareness.  
  
At minimum, each item should be able to preserve:  
	•	created date  
	•	last updated date  
  
Where appropriate, the system may also support:  
	•	still true  
	•	changed recently  
	•	unsure now  
  
Persistent context is allowed to evolve.  
It must not become static simply because it is saved.  
  
⸻  
  
13. Raw Entry + Normalized Summary Rule  
  
M4.1 must support both:  
	1.	raw user-facing entries  
	2.	normalized summary objects used by HARI  
  
Raw entry example  
  
“Driving makes my right rib and jaw tighten after a while.”  
  
Normalized summary example  
	•	trigger: driving  
	•	affected_regions: right rib, jaw  
	•	response_type: tightening  
	•	source: user entered  
	•	certainty: suspected or confirmed  
  
HARI should read normalized summaries, not rely on unprocessed raw text alone.  
  
The user-facing layer should preserve natural language.  
The system layer should preserve structured interpretability.  
  
⸻  
  
14. Intake Model  
  
Body Context must be fillable progressively over time.  
  
Do not require a full intake before use.  
Do not force first-time users through a long medical-style form.  
  
The system should support:  
	•	minimal initial entry  
	•	later section-by-section refinement  
	•	optional deeper completion over time  
  
This keeps mediCalm accessible during discomfort and allows depth to accumulate gradually.  
  
⸻  
  
15. Minimum Viable Entry Rule  
  
Body Context must remain optional.  
  
HARI must still function without saved Body Context, though with less personalization.  
  
No Body Context fields are strictly required before a user can run mediCalm.  
  
However, the system may encourage a small set of high-value entries, such as:  
	•	main sensitive or symptom regions  
	•	common triggers  
	•	common relievers  
  
Encouragement is allowed.  
Forced completion is not.  
  
⸻  
  
16. Session Structure Preference Rule  
  
Body Context may store long-term regulation preferences when they are useful across sessions.  
  
This includes:  
	•	general preference for shorter vs longer sessions  
	•	preference for quick resets vs deeper regulation sessions  
	•	tolerance for longer guided pacing  
  
These must be treated as preferences, not as direct proof of physiology.  
  
They may influence:  
	•	default session length  
	•	reassessment timing  
	•	pacing defaults  
	•	interpretation pacing  
  
They must not be treated as evidence that one method is medically superior.  
  
Session-specific goals or test length for today belong in the active session layer, not in Body Context.  
  
⸻  
  
17. Display Rule at Session Start  
  
Body Context must not be dumped in full at session start.  
  
Instead, mediCalm should show a compact summary banner such as:  
  
Using saved Body Context  
Right rib/cervical sensitivity, sitting/driving triggers, decompression breathing usually helps.  
  
A clear option to review or update Body Context should also be present.  
  
The session-start display should be:  
	•	compact  
	•	calm  
	•	useful  
	•	non-overwhelming  
  
⸻  
  
18. Previous Session Validation Gate  
  
Before starting a new session, mediCalm must require validation of the immediately previous session.  
  
The previous session must be resolved as either:  
	•	valid and kept  
	•	invalid and excluded  
  
A review option may also be available.  
  
This gate exists to prevent false or corrupted session results from entering memory before the next session begins.  
  
A new session should not begin while the immediately prior session remains unresolved.  
  
This rule reduces downstream rollback complexity and protects HARI data integrity.  
  
⸻  
  
19. Session Deletion Horizon Rule  
  
Deep retroactive deletion must not be allowed.  
  
The system should support:  
	•	deletion or invalidation of the just-finished session  
	•	one fail-safe deletion path for the immediately previous session, with strong warning  
  
The system must not allow standard deletion of sessions three or more back.  
  
The purpose of this limitation is to preserve sequential intelligence integrity and avoid deep rollback branching.  
  
This is a short-horizon reversibility model, not open historical rollback.  
  
⸻  
  
20. Reversion Rule  
  
HARI must use versioned intelligence state progression.  
  
Only valid retained sessions may advance the compacted long-term adaptive state.  
  
If a session that influenced memory is later invalidated within the supported deletion horizon, the system must revert to the prior valid state that existed before that session was applied.  
  
The system must not perform broad recomputation from scratch for this purpose.  
  
Reversion is the required model.  
Recalculation is not the default rollback model.  
  
⸻  
  
21. Body Context Independence Rule  
  
Deleting or invalidating a session must not silently delete user-entered Body Context.  
  
User-owned Body Context remains separate from session-derived influence.  
  
Only information that belongs to session-derived or system-derived layers may be reverted when a session is invalidated.  
  
If a future system-suggested Body Context item was based on invalidated sessions and had not been independently approved by the user, that suggestion should disappear or lose influence.  
  
But user-entered Body Context must remain intact unless the user explicitly removes it.  
  
⸻  
  
22. Evidence Threshold Rule  
  
M4.1 must not allow single-session observations to be silently treated as stable recurring history.  
  
Body Context stores user-provided persistent context.  
Derived recurring pattern conclusions belong outside M4.1 and require repeated valid session evidence.  
  
Suggested interpretation threshold for future HARI layers:  
	•	1 valid session = observation only  
	•	2 valid sessions = weak possible pattern  
	•	3 or more valid sessions = recurring pattern candidate  
  
M4.1 must preserve this boundary and avoid collapsing observation into established history.  
  
⸻  
  
23. Low-Confidence Fallback Compatibility  
  
When Body Context is sparse, uncertain, or absent, HARI must remain compatible with lower-confidence operation.  
  
This means:  
	•	simpler interpretation  
	•	more neutral language  
	•	less pattern depth  
	•	conservative intervention selection  
	•	shorter reassessment loops when needed  
  
Body Context should improve personalization, not become required for safe operation.  
  
⸻  
  
24. Editing Capabilities  
  
Body Context editing must support:  
	•	adding a single item  
	•	editing a single item  
	•	deleting a single item  
	•	clearing one section  
	•	resetting all Body Context  
  
These actions must be explicit and user-controlled.  
  
The user must always remain able to simplify, prune, or restart their persistent context.  
  
⸻  
  
25. Sensitive Tone Rule  
  
All Body Context prompting must feel calm, respectful, and useful.  
  
Do not present Body Context like an intimidating medical intake form.  
Do not overwhelm the user with heavy clinical phrasing.  
  
The tone should be:  
	•	grounded  
	•	gentle  
	•	clear  
	•	practical  
  
The goal is to help the user give useful context, not to make them feel interrogated.  
  
⸻  
  
26. Implementation Boundaries  
  
M4.1 implements:  
	•	Body Context identity  
	•	storage semantics  
	•	separation from other truth classes  
	•	user ownership rules  
	•	categories and structure  
	•	uncertainty preservation  
	•	editing model  
	•	summary model  
	•	interaction with session-start display  
	•	compatibility with session validation and reversion rules  
  
M4.1 does not implement:  
	•	active session state logic  
	•	session outcome scoring  
	•	pattern formation algorithms  
	•	intervention selection  
	•	explanation generation beyond Body Context summary behavior  
  
Those belong to later M4 layers.  
  
⸻  
  
27. Final Instruction to Claude Code  
  
Implement M4.1 as the persistent Body Context foundation for HARI.  
  
Your implementation must:  
	•	preserve strict separation between Body Context, active session state, session records, and derived intelligence  
	•	keep Body Context user-owned and editable  
	•	support structured categories with optional free text  
	•	preserve uncertainty and time awareness  
	•	support normalized summary objects for HARI use  
	•	remain optional, progressive, calm, and non-overwhelming  
	•	integrate cleanly with the previous-session validation gate and short-horizon reversion model  
  
Do not treat persistent history as a dumping ground for all data.  
Do not allow silent inference-to-history promotion.  
Do not sacrifice clarity for speed.  
  
This layer must make HARI deeper without making it less trustworthy. M4.2 MVP — Active Session State Intake Contract  
  
Status  
  
MVP implementation contract for the intake portion of M4.2.  
This contract narrows Active Session State into a clean first-release startup flow.  
  
Its purpose is to define the minimum viable live session intake required before a session begins, while preserving the fuller M4.2 architecture for later refinement.  
  
⸻  
  
1. Purpose  
  
This MVP contract defines the smallest useful pre-session input set for HARI.  
  
The goal is to make live session capture:  
	•	fast  
	•	calm  
	•	non-overwhelming  
	•	usable during discomfort  
	•	strong enough to support a safe first intervention choice  
  
This contract does not replace the full M4.2 architecture.  
It defines the first-release input layer that should exist before deeper live-state capture is added.  
  
⸻  
  
2. MVP Intake Principle  
  
The pre-session intake must gather only the inputs most necessary to choose a safe opening intervention.  
  
The MVP intake must not try to capture the entire live state model before the session starts.  
  
The opening flow should feel like:  
	•	a short readiness check  
	•	a quick session setup  
	•	a calm entry into regulation  
  
not a questionnaire.  
  
⸻  
  
3. Required MVP Inputs  
  
The MVP intake should ask for only these core inputs before session start:  
	1.	Session Intent  
	2.	Current Context / Posture  
	3.	Current Symptom Focus or Proactive Status  
	4.	Current Flare Sensitivity  
	5.	Today’s Session Length Preference  
  
This is the full MVP pre-session set.  
  
Do not require additional live-state fields before the session begins in MVP.  
  
⸻  
  
4. Input 1 — Session Intent  
  
The system should ask what the session is for today.  
  
MVP-supported options:  
	•	Quick reset  
	•	Deeper regulation  
	•	Flare-sensitive support  
	•	Cautious test  
  
This input helps determine:  
	•	initial pacing  
	•	intervention ambition  
	•	reassessment horizon  
  
The list should stay short in MVP.  
  
⸻  
  
5. Input 2 — Current Context / Posture  
  
The system should ask what context best matches the current situation.  
  
MVP-supported options:  
	•	Sitting  
	•	Standing  
	•	Driving / in vehicle  
	•	Lying down  
	•	After strain / overuse  
  
This input helps constrain:  
	•	current compression sensitivity interpretation  
	•	softness need  
	•	context-aware intervention framing  
  
Do not allow an overly long context list in MVP.  
  
⸻  
  
6. Input 3 — Current Symptom Focus or Proactive Status  
  
The system should ask what best describes the session focus right now.  
  
MVP-supported options:  
	•	Mostly proactive / no major symptom focus  
	•	Neck / upper region discomfort  
	•	Rib / side / back discomfort  
	•	Jaw / facial tension  
	•	More spread-out tension  
	•	Mixed / not sure  
  
This should remain broad and user-friendly.  
  
Do not force highly specific anatomical labeling in MVP.  
  
⸻  
  
7. Input 4 — Current Flare Sensitivity  
  
The system should ask how sensitive the body feels right now.  
  
MVP-supported options:  
	•	Low  
	•	Moderate  
	•	High  
	•	Not sure  
  
This is one of the most important safety inputs.  
  
In MVP, elevated flare sensitivity should strongly bias:  
	•	shorter opening sequence  
	•	softer intervention  
	•	earlier reassessment  
  
⸻  
  
8. Input 5 — Today’s Session Length Preference  
  
The system should ask what kind of session feels right today.  
  
MVP-supported options:  
	•	Shorter  
	•	Standard  
	•	Longer  
	•	Not sure  
  
This is a session-specific preference modifier.  
It is not evidence of physiology.  
  
In MVP, this input helps shape:  
	•	opening round length  
	•	checkpoint timing  
	•	session expectation  
  
Safety and current tolerance always override this preference.  
  
⸻  
  
9. Required UI Shape  
  
The MVP intake should ideally fit in:  
	•	one compact screen  
	•	or one short flow with minimal taps  
  
The user should be able to complete it quickly without feeling stalled before the session begins.  
  
Do not spread the MVP intake across too many screens.  
Do not bury the actual session behind heavy setup.  
  
⸻  
  
10. Optional Deeper Capture Rule  
  
Additional live-state details may be captured later through:  
	•	early reassessment  
	•	optional expansion after session start  
	•	adaptive prompts only when necessary  
  
Examples of later-captured details:  
	•	bracing level  
	•	breath restriction nuance  
	•	tension map  
	•	response trend  
  
These belong to the broader M4.2 architecture, but not the MVP startup burden.  
  
⸻  
  
11. Minimal Friction Rule  
  
The MVP intake must always favor speed and calm entry.  
  
This means:  
	•	no long forms  
	•	no open-ended narrative requirement  
	•	no excessive branching before the session starts  
	•	no clinical-feeling interrogation  
  
The user should be able to begin regulation quickly, especially during discomfort.  
  
⸻  
  
12. Defaulting Rule  
  
If the user is unsure on one or more inputs, the system must still allow session start.  
  
Supported uncertain options such as:  
	•	Not sure  
	•	Mixed  
	•	Proactive / unclear  
  
must be treated as valid inputs.  
  
Uncertainty should trigger more conservative opening choices, not blockage.  
  
⸻  
  
13. Current Session First Rule  
  
The MVP intake must remain session-specific.  
  
It may reference Body Context lightly at the top, such as:  
  
Using saved Body Context  
  
but the user must still be able to define today’s session on its own terms.  
  
Persistent preferences or history must not silently replace today’s live input.  
  
⸻  
  
14. Previous Session Validation Dependency  
  
The MVP intake flow must only appear after the previous-session validation gate is cleared.  
  
The user must confirm the prior session as:  
	•	kept  
	•	or invalid  
  
before starting a new session intake.  
  
This keeps the memory chain clean.  
  
⸻  
  
15. Output Role  
  
The MVP intake should produce a compact structured startup state that feeds M4.3.  
  
Suggested output fields:  
	•	Session_Intent  
	•	Current_Context  
	•	Symptom_Focus  
	•	Flare_Sensitivity  
	•	Session_Length_Preference  
  
This output should be considered the minimum viable live-state seed, not the full session model.  
  
⸻  
  
16. Explainability Rule  
  
The intake should support short pre-session framing such as:  
	•	“We’ll keep this brief and gentle to start.”  
	•	“Today looks more flare-sensitive, so we’ll check in early.”  
	•	“This session will start with a softer approach and adapt from there.”  
  
The wording should remain calm, supportive, and practical.  
  
⸻  
  
17. Failure Modes to Prevent  
  
The MVP intake must actively avoid:  
  
A. Startup overload  
  
Too many required inputs before the session starts.  
  
B. False precision  
  
Asking for more detail than the opening intervention actually needs.  
  
C. Friction during pain  
  
Making the user work too hard just to begin.  
  
D. Clinical intimidation  
  
Making the product feel like a medical intake form.  
  
E. Hidden history override  
  
Letting Body Context silently replace today’s session choices.  
  
⸻  
  
18. Final Instruction to Claude Code  
  
Implement this contract as the MVP intake layer for M4.2.  
  
Your implementation must:  
	•	limit required pre-session inputs to the 5 approved fields  
	•	keep the flow compact and low-friction  
	•	allow uncertainty without blocking session start  
	•	treat the result as a minimum viable startup state, not the full live-state model  
	•	defer richer live-state capture until reassessment or later prompts when needed  
  
Do not front-load the full M4.2 architecture into the first screen.  
Do not make the user earn access to the session.  
Do not sacrifice calm usability for completeness.  
  
This MVP contract exists to make HARI usable in real conditions, not just architecturally impressive.  M4.3 — State Estimation Engine Contract  
  
Status  
  
Implementation contract for M4.3.  
This contract defines the internal state-estimation layer for HARI.  
  
M4.3 establishes how mediCalm converts Body Context and Active Session State into a conservative, explainable, non-diagnostic working estimate of the user’s current regulation-relevant condition.  
  
This layer is the first true internal reasoning engine of M4.  
If later prompts conflict with this contract, this contract wins unless a higher safety rule overrides it.  
  
⸻  
  
1. Purpose  
  
M4.3 defines the State Estimation Engine.  
  
The purpose of this engine is to translate:  
	•	persistent Body Context  
	•	current Active Session State  
	•	validated recent session influence where appropriate  
  
into a structured internal estimate of the user’s current regulation-relevant state.  
  
This estimate exists to help HARI choose safer, better-matched interventions.  
  
It is not a diagnosis.  
It is not a structural explanation.  
It is not proof of anatomy or pathology.  
It is not a hidden certainty machine.  
  
It is a conservative working model for regulation.  
  
⸻  
  
2. Core Definition  
  
The State Estimation Engine is:  
	•	internal  
	•	explainable  
	•	probabilistic in meaning  
	•	deterministic in implementation at first  
	•	reversible at the session level  
	•	constrained by safety and scope  
  
The State Estimation Engine is not:  
	•	a pathology classifier  
	•	an injury detector  
	•	an anatomy inference engine  
	•	a black-box reasoning layer  
	•	a free-form AI speculation system  
  
Its job is to estimate functional state tendencies that matter for regulation.  
  
⸻  
  
3. Inputs  
  
M4.3 may draw from the following sources, in this order of authority:  
	1.	Active Session State  
	2.	validated recent session evidence where allowed  
	3.	Body Context  
	4.	low-confidence pattern intelligence where already supported by later layers  
  
At the M4.3 stage, the engine must remain compatible with operation even if only:  
	•	Active Session State exists  
	•	Active Session State + Body Context exist  
  
It must not depend on advanced pattern intelligence to function.  
  
⸻  
  
4. Output Role  
  
The output of M4.3 is a structured working state estimate used by later layers such as:  
	•	link mapping  
	•	intervention selection  
	•	explanation generation  
	•	reassessment updating  
  
The output must be:  
	•	interpretable  
	•	constrained  
	•	non-diagnostic  
	•	suitable for low-risk adaptation  
	•	compatible with revision during the same session  
  
This output is not user history.  
This output is not the session record archive.  
This output is not long-term truth.  
  
⸻  
  
5. Estimation Philosophy  
  
The engine must estimate state tendencies, not definitive causes.  
  
Good estimation targets include:  
	•	compression sensitivity  
	•	expansion capacity  
	•	guarding load  
	•	flare sensitivity  
	•	response readiness  
	•	pacing tolerance  
	•	likelihood of needing softer regulation  
	•	likelihood of needing shorter reassessment loops  
  
Bad estimation targets include:  
	•	which structure is injured  
	•	which nerve is compressed  
	•	exact mechanical lesion  
	•	definitive root cause  
	•	unverified biomechanical certainty  
  
The engine must remain grounded in functional regulation language.  
  
⸻  
  
6. Initial Implementation Style  
  
The first implementation of M4.3 must be deterministic and rule-based.  
  
Do not begin with black-box scoring, hidden model behavior, or pseudo-intelligent speculation.  
  
Early M4.3 should work like this:  
	•	read bounded inputs  
	•	apply explicit weighting logic  
	•	produce constrained state outputs  
	•	allow later refinement without losing interpretability  
  
Clarity is more important than sophistication in the first version.  
  
⸻  
  
7. Minimum State Outputs  
  
M4.3 must support a minimum internal output set.  
  
Suggested baseline outputs:  
	•	Compression_Sensitivity  
	•	Expansion_Capacity  
	•	Guarding_Load  
	•	Flare_Sensitivity_Estimate  
	•	Session_Tolerance  
	•	Reassessment_Urgency  
	•	Intervention_Softness_Need  
	•	Confidence_Level  
  
These names may be refined, but the output set must remain small enough to stay interpretable.  
  
Do not explode the state model into too many variables too early.  
  
⸻  
  
8. Compression Sensitivity  
  
Compression_Sensitivity is an estimate of how likely the current session is to respond poorly to compressive, effortful, or over-braced regulation approaches.  
  
This may be influenced by:  
	•	high flare sensitivity  
	•	high bracing  
	•	symptom spread during the session  
	•	context such as prolonged sitting or driving  
	•	user report of current irritation or tightening  
	•	Body Context suggesting recurrent compression-sensitive patterns  
  
This output must not imply proof of structural compression.  
It is a regulation-oriented estimate only.  
  
⸻  
  
9. Expansion Capacity  
  
Expansion_Capacity is an estimate of how available soft, comfortable, non-strained expansion currently seems.  
  
This may be influenced by:  
	•	reported ease or difficulty of breathing  
	•	current restriction feeling  
	•	current tension map  
	•	whether prior gentle expansion tends to help  
	•	whether the user is struggling to follow breath cues comfortably  
  
This estimate must remain functional.  
It must not claim anything about exact anatomical restriction.  
  
⸻  
  
10. Guarding Load  
  
Guarding_Load is an estimate of how elevated protective muscular or behavioral guarding appears in the current session.  
  
This may be influenced by:  
	•	reported bracing  
	•	over-control of breath  
	•	difficulty relaxing  
	•	postural over-efforting  
	•	symptom-related self-protection behavior  
	•	live tension distribution  
  
This is one of the most important state outputs and should strongly influence intervention softness and pacing.  
  
⸻  
  
11. Flare Sensitivity Estimate  
  
Flare_Sensitivity_Estimate is the engine’s working estimate of current session irritability and sensitivity to escalation.  
  
This may be influenced by:  
	•	explicit flare-sensitive input  
	•	symptom intensity  
	•	rapid spread during session  
	•	current intolerance of effort  
	•	worsening during reassessment  
	•	user-reported session fragility  
  
When this output is elevated, the engine must bias later layers toward:  
	•	softer intervention  
	•	shorter cycles  
	•	earlier reassessment  
	•	reduced complexity  
  
⸻  
  
12. Session Tolerance  
  
Session_Tolerance is an estimate of how much intensity, duration, and exploratory depth is appropriate for the current session.  
  
This may be influenced by:  
	•	today’s preference for shorter or longer session  
	•	current irritability  
	•	ease of following cues  
	•	whether the session is quick reset vs deeper regulation  
	•	recent response trend  
	•	user history of preferring shorter or longer guided pacing  
  
This estimate should help prevent overextending a user in a bad moment.  
  
⸻  
  
13. Reassessment Urgency  
  
Reassessment_Urgency estimates how soon the system should check in again before continuing.  
  
This may be influenced by:  
	•	high flare sensitivity  
	•	worsening trend  
	•	high guarding load  
	•	low expansion capacity  
	•	high uncertainty  
	•	exploratory testing mode  
	•	short-session preference  
  
Higher reassessment urgency should lead to:  
	•	shorter breathing rounds before check-in  
	•	less assumption stacking  
	•	faster opportunity to downshift or stop  
  
⸻  
  
14. Intervention Softness Need  
  
Intervention_Softness_Need is an estimate of how gentle the next regulation step should be.  
  
This may be influenced by:  
	•	compression sensitivity  
	•	flare sensitivity  
	•	guarding load  
	•	worsening trend  
	•	low expansion capacity  
	•	low confidence  
  
This output should not directly choose the intervention by itself, but it should strongly constrain later intervention selection.  
  
⸻  
  
15. Confidence Level  
  
Confidence_Level is the engine’s estimate of how well-supported the current working state estimate is.  
  
This may be influenced by:  
	•	clarity of current session inputs  
	•	consistency between inputs  
	•	presence or absence of relevant Body Context  
	•	recent session validation quality  
	•	amount of unresolved uncertainty  
  
Confidence must influence behavior.  
  
When confidence is lower, HARI must:  
	•	simplify interpretation  
	•	reduce explanatory ambition  
	•	lower intervention intensity  
	•	shorten reassessment loops  
	•	avoid strong pattern claims  
  
Confidence is not a claim of medical certainty.  
It is only a measure of support for the current working estimate.  
  
⸻  
  
16. Input Weighting Rule  
  
The State Estimation Engine must weight inputs conservatively.  
  
Weighting priority  
	1.	current Active Session State  
	2.	validated immediately relevant recent session evidence  
	3.	Body Context  
	4.	low-confidence inferred pattern background  
  
This means:  
	•	current live discomfort can override older history  
	•	older preferences must not dominate today’s reality  
	•	one strong current signal may justify simplification even if history suggests otherwise  
  
The weighting logic must remain explicit and explainable.  
  
⸻  
  
17. No Single-Input Absolutism  
  
The engine must never allow one isolated input to become an overconfident state conclusion unless it is being used only to increase caution.  
  
Examples:  
	•	one symptom location must not define the whole state  
	•	one tension report must not become a full chain conclusion  
	•	one preference must not imply tolerance  
	•	one old history note must not override present worsening  
  
However, a single high-risk signal may justify safer downshifting.  
  
This asymmetry is intentional.  
  
⸻  
  
18. Conservative Bias Rule  
  
When there is ambiguity, the State Estimation Engine must bias toward:  
	•	lower intensity  
	•	shorter assumption horizon  
	•	simpler explanations  
	•	earlier reassessment  
	•	softer intervention constraints  
  
The engine must not generate extra complexity to compensate for uncertainty.  
  
⸻  
  
19. Explainability Rule  
  
Every major state output must be explainable in plain language.  
  
The system should be able to support reasoning such as:  
  
“Because today feels more flare-sensitive, braced, and restricted, HARI is treating this as a softer, shorter, more reassessment-driven session.”  
  
This explanation must remain:  
	•	non-diagnostic  
	•	current-state-focused  
	•	conservative  
	•	understandable  
  
If a state output cannot be meaningfully explained, it should not exist in the early design.  
  
⸻  
  
20. Output Shape Rule  
  
The engine must produce structured outputs, not only narrative text.  
  
Each output should ideally support:  
	•	state label  
	•	estimated level or band  
	•	confidence support level  
	•	key contributing factors  
  
Example shape:  
	•	Compression_Sensitivity: elevated  
	•	Confidence_Level: moderate  
	•	Key_Factors: driving context, high bracing, flare-sensitive input  
  
This makes later layers easier to build and audit.  
  
⸻  
  
21. Banding Rule  
  
Early M4.3 should use simple bands or buckets rather than false numerical precision.  
  
Recommended examples:  
	•	low / moderate / elevated  
	•	low / moderate / high  
	•	unclear / present / strong  
  
Avoid precise percentages or granular scoring unless clearly justified later.  
  
Banding is preferred because it is:  
	•	easier to reason about  
	•	easier to explain  
	•	less likely to create fake certainty  
  
⸻  
  
22. Mid-Session Update Compatibility  
  
The State Estimation Engine must support revision within the same session.  
  
As Active Session State changes through reassessment, M4.3 should be able to:  
	•	update the working estimate  
	•	soften or strengthen certain outputs  
	•	reduce or raise reassessment urgency  
	•	reflect improvement, worsening, or mixed response  
  
The engine must remain dynamic inside the session, but it must do so conservatively.  
  
⸻  
  
23. Low-Confidence Fallback Mode  
  
If inputs are sparse, inconsistent, or unclear, M4.3 must enter a lower-confidence mode.  
  
Lower-confidence mode should result in:  
	•	fewer strong state assumptions  
	•	broader and safer intervention constraints  
	•	simpler explanation language  
	•	faster check-ins  
	•	reduced exploratory progression  
  
The engine must not fabricate a rich state model when input support is weak.  
  
⸻  
  
24. State Estimate vs Pattern Claim Boundary  
  
M4.3 must distinguish between:  
	•	a current-session state estimate  
	•	a repeated cross-session pattern claim  
  
M4.3 may say, in effect:  
	•	“today looks more compression-sensitive”  
	•	“this session currently appears flare-sensitive”  
  
M4.3 must not act as though it has proven:  
	•	a stable recurring long-term pattern  
	•	a validated cross-session chain conclusion  
	•	a durable personal law  
  
Those belong to later learning layers.  
  
⸻  
  
25. State Estimate vs Body Context Boundary  
  
M4.3 must not write its own outputs into Body Context.  
  
Even if a state estimate appears repeatedly, it remains separate until later layers gather enough valid evidence and the product’s suggestion-and-confirmation rules are satisfied.  
  
No silent promotion from temporary state estimate to persistent history is allowed.  
  
⸻  
  
26. Invalid Session Compatibility  
  
If a session is later marked invalid or deleted within the supported rollback window, any state estimate derived from that session must lose its ability to influence later adaptive memory progression.  
  
M4.3 is session-useful first.  
Its broader learning influence depends on later validation and retention.  
  
⸻  
  
27. Failure Modes to Prevent  
  
The implementation must actively guard against the following:  
  
Failure Mode A — pseudo-medical diagnosis  
  
The engine sounds like it knows pathology.  
  
Failure Mode B — over-granular scoring theater  
  
The engine uses fake precision to seem intelligent.  
  
Failure Mode C — history dominance  
  
Old Body Context overrides today’s reality.  
  
Failure Mode D — single-input overreach  
  
One data point becomes a whole-state story.  
  
Failure Mode E — opaque reasoning  
  
The system cannot explain how it reached the state estimate.  
  
Failure Mode F — drift into pattern learning too early  
  
The current session estimate is mistaken for long-term truth.  
  
All six must be prevented.  
  
⸻  
  
28. Implementation Boundaries  
  
M4.3 implements:  
	•	the live internal state-estimation layer  
	•	deterministic weighting logic  
	•	small interpretable state output sets  
	•	conservative confidence-aware estimation  
	•	revision during reassessment  
	•	structured state outputs for later layers  
  
M4.3 does not implement:  
	•	advanced cross-session learning  
	•	link mapping logic itself  
	•	intervention selection logic itself  
	•	long-term pattern confidence compaction  
	•	persistent history mutation  
  
Those belong to later layers.  
  
⸻  
  
29. Final Instruction to Claude Code  
  
Implement M4.3 as the State Estimation Engine for HARI.  
  
Your implementation must:  
	•	convert current session inputs and relevant context into a small, explainable working state estimate  
	•	remain deterministic and rule-based in the first version  
	•	use conservative banded outputs rather than fake precision  
	•	prioritize Active Session State over older assumptions  
	•	make confidence meaningfully constrain later behavior  
	•	stay non-diagnostic, non-anatomical, and medically restrained  
	•	remain compatible with mid-session revision and low-confidence fallback  
  
Do not build a black box.  
Do not overproduce variables.  
Do not confuse functional state estimation with medical certainty.  
  
This layer must make HARI intelligently adaptive without becoming opaque or reckless. M4.4 — Link Mapping Engine Contract  
  
Status  
  
Implementation contract for M4.4.  
This contract defines the relationship-modeling layer for HARI.  
  
M4.4 establishes how mediCalm represents likely functional links between current states, regions, tendencies, and regulation-relevant patterns without turning those links into diagnostic or structural certainty.  
  
This layer builds on M4.1, M4.2, and M4.3.  
If later prompts conflict with this contract, this contract wins unless a higher safety rule overrides it.  
  
⸻  
  
1. Purpose  
  
M4.4 defines the Link Mapping Engine.  
  
Its purpose is to help HARI model likely relationships between:  
	•	current session state tendencies  
	•	user-reported symptom regions  
	•	known Body Context tendencies  
	•	state-estimation outputs  
	•	regulation-relevant spread or interaction patterns  
  
The goal is not to explain the body with certainty.  
The goal is to support safer intervention selection and more coherent current-session reasoning.  
  
The Link Mapping Engine exists to answer questions like:  
	•	what current links may be functionally relevant right now?  
	•	what relationships are plausible enough to influence the next low-risk step?  
	•	what pattern framing is helpful without overclaiming?  
  
⸻  
  
2. Core Definition  
  
The Link Mapping Engine is:  
	•	probabilistic in meaning  
	•	conservative in interpretation  
	•	structured  
	•	explainable  
	•	session-relevant  
	•	compatible with revision  
  
The Link Mapping Engine is not:  
	•	a structural diagnosis map  
	•	a lesion locator  
	•	an anatomy certainty layer  
	•	proof of root cause  
	•	a substitute for medical evaluation  
  
It produces likely functional relationship maps, not hard causal truth.  
  
⸻  
  
3. Relationship Philosophy  
  
M4.4 must model functional links rather than proven anatomical causation.  
  
Good link framing includes:  
	•	tension in one region may be interacting with another  
	•	a current pattern is consistent with a broader protective chain  
	•	certain states often travel together in this context  
	•	a current symptom cluster may justify a softer linked interpretation  
  
Bad link framing includes:  
	•	this region is definitely causing that region  
	•	this proves a specific compressed structure  
	•	this confirms a nerve pathway issue  
	•	this is the exact biomechanical mechanism  
  
The engine must always preserve uncertainty and reversibility.  
  
⸻  
  
4. Inputs  
  
M4.4 may draw from:  
	1.	M4.3 State Estimation outputs  
	2.	current Active Session State  
	3.	Body Context where relevant  
	4.	validated recent session evidence where allowed  
	5.	later pattern support only when already established through proper thresholds  
  
The primary driver for M4.4 should be the current session working estimate, not raw history alone.  
  
⸻  
  
5. Output Role  
  
The output of M4.4 is a structured current-session link map.  
  
This map helps later layers:  
	•	constrain intervention choice  
	•	explain why a softer or broader regulation approach may be appropriate  
	•	avoid overly local thinking when the current pattern appears more distributed  
	•	decide whether to stay local, stay global, or reassess earlier  
  
The link map is a current working representation.  
It is not long-term truth.  
It is not automatically a recurring pattern.  
It is not Body Context.  
  
⸻  
  
6. What a Link Means  
  
A link in M4.4 means:  
	•	two or more states or regions may be interacting in a regulation-relevant way right now  
	•	the relationship is plausible enough to influence low-risk intervention choice  
	•	the system has enough support to treat the relationship as a useful working hypothesis  
  
A link does not mean:  
	•	verified causality  
	•	permanent trait  
	•	structural explanation  
	•	medical conclusion  
  
The meaning of a link must remain narrow and practical.  
  
⸻  
  
7. Link Categories  
  
M4.4 should support a small set of interpretable link categories.  
  
Suggested baseline categories:  
	•	Regional Tension Link  
	•	Compression-Spread Link  
	•	Guarding Distribution Link  
	•	Posture-to-State Link  
	•	Context-to-State Link  
	•	Response Pattern Link  
	•	Preference/Tolerance Link  
  
These categories may be refined later, but the system must stay compact and understandable.  
  
Do not build an overly large ontology at this stage.  
  
⸻  
  
8. Regional Tension Links  
  
Regional Tension Links represent plausible interaction between tension-relevant regions during the current session.  
  
Examples of acceptable framing:  
	•	current rib and jaw tension may be participating in the same broader protective pattern  
	•	neck and upper chest tension may be interacting in a way that justifies a softer global downshift  
	•	current tension appears more distributed than isolated  
  
These links must remain descriptive and regulation-oriented.  
They must not claim anatomy-level mechanism.  
  
⸻  
  
9. Compression-Spread Links  
  
Compression-Spread Links represent a plausible relationship between compression-sensitive state outputs and symptom spread or escalation behavior.  
  
Examples of acceptable use:  
	•	a more compression-sensitive session appears to be associated with upward symptom spread  
	•	current tightening and spread suggest the session may benefit from decompression-oriented pacing  
	•	this pattern currently looks less isolated and more escalation-linked  
  
These links must not be framed as proof that one structure is physically compressing another.  
  
⸻  
  
10. Guarding Distribution Links  
  
Guarding Distribution Links represent the idea that elevated guarding may be shaping how multiple regions or behaviors are interacting.  
  
Examples:  
	•	current guarding load may be contributing to both breath difficulty and neck/jaw tension  
	•	elevated bracing appears to be making the session more globally protective  
	•	over-control of posture and breath may be part of the same current regulation problem  
  
These links are often high-value because they support safer de-intensification.  
  
⸻  
  
11. Posture-to-State Links  
  
Posture-to-State Links represent plausible links between the immediate physical context and the current state estimate.  
  
Examples:  
	•	prolonged sitting context may be contributing to a more compression-sensitive session  
	•	current driving context appears linked to elevated guarding and earlier reassessment need  
	•	lying down context may support a lower-effort regulation approach  
  
This category is contextual, not causal.  
  
⸻  
  
12. Context-to-State Links  
  
Context-to-State Links represent broader situational contributors that may be relevant to the current working state.  
  
Examples:  
	•	post-strain context may be interacting with flare sensitivity  
	•	after-compression context may be increasing intervention softness need  
	•	exploratory session intent may need to be constrained by current irritability  
  
This category helps HARI avoid treating symptoms as disconnected from the immediate session situation.  
  
⸻  
  
13. Response Pattern Links  
  
Response Pattern Links represent emerging in-session relationships between intervention and response.  
  
Examples:  
	•	softer breathing appears to reduce tension spread more than deeper effort  
	•	shorter rounds may be better tolerated in the current state  
	•	current response suggests local focus is less effective than broader downshifting  
  
These links are session-bound unless later learning layers validate them repeatedly.  
  
This category is important because it lets HARI adapt within the session without pretending to have long-term proof.  
  
⸻  
  
14. Preference/Tolerance Links  
  
Preference/Tolerance Links represent the interaction between session structure preference and state tolerance.  
  
Examples:  
	•	today’s shorter-session preference aligns with elevated reassessment urgency  
	•	even though longer sessions are generally preferred, current tolerance appears reduced  
	•	session intent and current flare sensitivity suggest staying brief first  
  
These links help keep user preference grounded in current-state reality.  
  
Preferences must never be treated as standalone evidence of bodily truth.  
  
⸻  
  
15. Link Strength Model  
  
Early M4.4 should use simple link-strength banding.  
  
Recommended examples:  
	•	weak  
	•	moderate  
	•	elevated  
  
or:  
	•	possible  
	•	supported  
	•	strongly supported for this session  
  
Do not use highly granular scoring or false numerical precision.  
  
Link strength should describe how usable the link is for current regulation reasoning, not how medically true it is.  
  
⸻  
  
16. Support Factors  
  
Each link should preserve a small set of support factors.  
  
Examples:  
	•	current high guarding load  
	•	elevated compression sensitivity  
	•	driving context  
	•	reported jaw + rib tension together  
	•	worsening under deeper effort  
	•	prior Body Context suggesting similar tendency  
  
Support factors help maintain transparency and prevent opaque reasoning.  
  
⸻  
  
17. Session-Bound First Rule  
  
M4.4 must be current-session-first.  
  
Even if Body Context suggests a familiar link pattern, the engine should not force that map onto the current session unless live support exists.  
  
This means:  
	•	old patterns can bias attention  
	•	current inputs must still justify actual active links  
  
The current session must always have veto power over history-driven expectations.  
  
⸻  
  
18. No Chain Inflation Rule  
  
The Link Mapping Engine must not inflate sparse evidence into large, elaborate chain stories.  
  
Examples of prohibited behavior:  
	•	turning two tension regions into a full causal cascade  
	•	adding multiple unseen regions to sound intelligent  
	•	inferring a whole-body explanation from one local report  
	•	narrating elaborate biomechanical chains without enough support  
  
Early M4.4 should prefer smaller, cleaner links over dramatic connectedness.  
  
⸻  
  
19. Conservative Link Use Rule  
  
A link only needs to be strong enough to justify a safer low-risk choice.  
  
That means the threshold for using a link may be lower when the consequence is simply:  
	•	soften intervention  
	•	shorten the session  
	•	broaden the regulation frame  
	•	reassess sooner  
  
The threshold must be much higher for any explanatory ambition.  
  
This asymmetry is required.  
  
⸻  
  
20. Explanation Rule  
  
M4.4 should support explanation language such as:  
	•	“Your current rib, neck, and jaw tension may be participating in the same broader protective pattern, so we’ll avoid pushing locally and use a softer whole-pattern regulation approach first.”  
	•	“This session appears more compression-sensitive in the current sitting context, so we’ll bias toward shorter reassessment loops.”  
  
These explanations must remain:  
	•	non-diagnostic  
	•	cautious  
	•	current-session-focused  
	•	easy to understand  
  
Do not allow the explanation layer to convert link maps into certainty.  
  
⸻  
  
21. Link Output Shape  
  
The Link Mapping Engine must produce structured outputs.  
  
Each link should ideally support:  
	•	Link_Type  
	•	Linked_Elements  
	•	Link_Strength  
	•	Confidence_Support  
	•	Support_Factors  
	•	Session_Bound_Status  
  
Example:  
	•	Link_Type: Guarding Distribution Link  
	•	Linked_Elements: high guarding load, jaw tension, breath difficulty  
	•	Link_Strength: supported  
	•	Confidence_Support: moderate  
	•	Support_Factors: high bracing, difficult relaxation, upper-chain tension map  
	•	Session_Bound_Status: current-session working link  
  
This structure supports later intervention logic and auditability.  
  
⸻  
  
22. Confidence Compatibility  
  
M4.4 must remain compatible with M4.3 confidence logic.  
  
When confidence is lower:  
	•	fewer links should be created  
	•	link strength should be reduced  
	•	explanations should become simpler  
	•	intervention constraints should stay conservative  
  
Low confidence must reduce link ambition.  
It must not produce compensatory theory-making.  
  
⸻  
  
23. Mid-Session Revision Rule  
  
The link map must be revisable during the same session.  
  
As reassessment changes the current working state, M4.4 should be able to:  
	•	weaken links  
	•	strengthen links  
	•	collapse multiple links into a simpler interpretation  
	•	remove links that are no longer supported  
	•	replace early assumptions with cleaner current evidence  
  
The link map must remain flexible and temporary.  
  
⸻  
  
24. Current Link vs Long-Term Pattern Boundary  
  
M4.4 must clearly separate:  
	•	current-session link maps  
	•	long-term recurring pattern conclusions  
  
A current-session link may later contribute evidence to long-term learning, but it is not itself a validated cross-session pattern.  
  
No silent promotion from current-session link map to durable pattern truth is allowed.  
  
That boundary must remain strict.  
  
⸻  
  
25. Current Link vs Body Context Boundary  
  
M4.4 must not write inferred links into Body Context.  
  
Even if a link seems plausible and repeats, Body Context remains user-owned and confirmation-based.  
  
M4.4 outputs may inform later suggestions, but they must not mutate persistent history directly.  
  
⸻  
  
26. Invalid Session Compatibility  
  
If a session is later invalidated or deleted within the supported rollback window, its link map must not continue to influence adaptive memory progression.  
  
M4.4 is useful inside the live session first.  
Any broader learning consequence depends on later validation layers.  
  
⸻  
  
27. Failure Modes to Prevent  
  
The implementation must actively guard against the following:  
  
Failure Mode A — causal overclaim  
  
The engine speaks as if it proved causation.  
  
Failure Mode B — chain theater  
  
The system creates impressive-sounding multi-step stories from weak evidence.  
  
Failure Mode C — history projection  
  
Old Body Context is forced onto a session that does not support it.  
  
Failure Mode D — opaque linking  
  
The system cannot explain why a link exists.  
  
Failure Mode E — local trap  
  
The system focuses too narrowly when the current pattern appears broader.  
  
Failure Mode F — global overreach  
  
The system broadens too much when the current evidence is still mostly local.  
  
All six must be prevented.  
  
⸻  
  
28. Implementation Boundaries  
  
M4.4 implements:  
	•	the current-session relationship modeling layer  
	•	small, interpretable link categories  
	•	support-factor-based link outputs  
	•	confidence-aware and revisable link mapping  
	•	explainable functional relationship framing  
  
M4.4 does not implement:  
	•	long-term pattern learning  
	•	persistent history mutation  
	•	intervention selection itself  
	•	session outcome archival  
	•	advanced causal inference  
  
Those belong to later layers.  
  
⸻  
  
29. Final Instruction to Claude Code  
  
Implement M4.4 as the Link Mapping Engine for HARI.  
  
Your implementation must:  
	•	model likely functional links in a conservative, current-session-focused way  
	•	build on state estimates rather than raw speculation  
	•	use small interpretable link categories and simple strength banding  
	•	preserve support factors and explainability  
	•	allow mid-session revision as evidence changes  
	•	remain non-diagnostic, non-causal, and medically restrained  
	•	avoid chain inflation, false certainty, and history projection  
  
Do not build an anatomy story machine.  
Do not create impressive complexity from weak support.  
Do not silently turn working links into long-term truth.  
  
This layer must help HARI think in connected patterns without making it reckless or fictional. M4.5 — Intervention Selector Contract  
  
Status  
  
Implementation contract for M4.5.  
This contract defines the intervention-decision layer for HARI.  
  
M4.5 establishes how mediCalm selects the safest, best-matched breath-led regulation response for the current session using Body Context, Active Session State, State Estimation outputs, and Link Mapping outputs.  
  
This layer builds on M4.0 through M4.4.  
If later prompts conflict with this contract, this contract wins unless a higher safety rule overrides it.  
  
⸻  
  
1. Purpose  
  
M4.5 defines the Intervention Selector.  
  
Its purpose is to choose the next low-risk regulation step that is most appropriate for the current session.  
  
The Intervention Selector exists to answer:  
	•	what kind of breath-led intervention should happen next?  
	•	how soft or cautious should it be?  
	•	how long should the system wait before reassessing?  
	•	should the session continue, simplify, shorten, or downshift?  
  
This layer is where HARI becomes practically useful.  
  
It is not a treatment authority.  
It is not a diagnosis engine.  
It is not a force-progression system.  
It is not allowed to choose intensity simply to appear advanced.  
  
⸻  
  
2. Core Definition  
  
The Intervention Selector is:  
	•	current-session-focused  
	•	conservative  
	•	reversible  
	•	bounded by safety  
	•	explainable  
	•	adaptive to reassessment  
  
The Intervention Selector is not:  
	•	a high-risk technique recommender  
	•	a structural correction engine  
	•	a willpower or tolerance test  
	•	a progression machine that assumes more is better  
  
Its job is to select the lowest-risk effective next step, not the most ambitious one.  
  
⸻  
  
3. Inputs  
  
M4.5 may draw from:  
	1.	Active Session State  
	2.	M4.3 State Estimation outputs  
	3.	M4.4 Link Mapping outputs  
	4.	Body Context where relevant  
	5.	validated recent session evidence where allowed  
  
The Intervention Selector must remain heavily driven by the current session.  
  
Older history may personalize the decision.  
It must not dominate the session when current evidence suggests otherwise.  
  
⸻  
  
4. Output Role  
  
The output of M4.5 is a structured intervention decision package.  
  
This package should tell mediCalm:  
	•	what type of intervention to use next  
	•	how soft or direct it should be  
	•	how long it should run before reassessment  
	•	what the current objective is  
	•	what constraints must remain active  
  
This output should be usable by:  
	•	session runtime  
	•	pacing logic  
	•	explanation layer  
	•	reassessment layer  
  
⸻  
  
5. Intervention Philosophy  
  
The selector must always operate under this principle:  
  
choose the safest breath-led response that is appropriate for the current state and easy to revise.  
  
That means the selector should prefer:  
	•	softer over more forceful  
	•	simpler over more complex under uncertainty  
	•	shorter before longer when irritability is high  
	•	earlier reassessment when support is weak  
	•	adaptable steps over rigid fixed sequences  
  
The selector must not assume:  
	•	deeper is better  
	•	longer is better  
	•	more effort is better  
	•	stronger expansion is better  
	•	persistence through worsening is useful  
  
⸻  
  
6. Allowed Intervention Classes  
  
Early M4.5 should choose between a small number of interpretable intervention classes.  
  
Suggested baseline classes:  
	•	Soft Decompression Breathing  
	•	Gentle Lateral / Back-Rib Expansion Breathing  
	•	Reduced-Effort Regulation Breathing  
	•	Short Micro-Reset Sequence  
	•	Standard Guided Regulation Sequence  
	•	Short Reassessment-First Test Sequence  
	•	Downshift / Simplify Response  
	•	Session Pause / Session Stop Recommendation  
  
These classes may be renamed later, but the selector must remain compact and understandable.  
  
Do not generate a sprawling library too early.  
  
⸻  
  
7. Intervention Objectives  
  
Each selected intervention should have a clear immediate objective.  
  
Examples:  
	•	reduce guarding  
	•	lower compressive effort  
	•	test tolerability gently  
	•	improve comfort with expansion  
	•	interrupt escalation  
	•	check whether a broader pattern softens  
	•	avoid pushing local intensity  
  
The system should always know what the intervention is trying to accomplish.  
  
Do not choose a breath pattern without a current objective.  
  
⸻  
  
8. Softness First Rule  
  
When uncertainty, flare sensitivity, guarding load, or compression sensitivity are elevated, the selector must bias strongly toward softer intervention classes.  
  
Examples of softer bias include:  
	•	decompression emphasis  
	•	reduced breath effort  
	•	shorter sessions  
	•	shorter rounds before check-in  
	•	broader downshift rather than local pushing  
  
Softness is not weakness.  
It is the preferred adaptive response under uncertainty or irritability.  
  
⸻  
  
9. Session Length and Pacing Rule  
  
The selector must decide not only what intervention to use, but also how long to use it before reassessment.  
  
This may be influenced by:  
	•	Session_Tolerance  
	•	Reassessment_Urgency  
	•	flare sensitivity  
	•	session intent  
	•	today’s shorter vs longer session preference  
	•	current response trend  
  
The selector must not use a fixed time horizon across all states.  
  
A shorter, softer session is often the better choice in a fragile moment.  
  
⸻  
  
10. Reassessment-Driven Design Rule  
  
Every selected intervention must be paired with a reassessment plan.  
  
The selector must define:  
	•	when the next check-in occurs  
	•	what the system is watching for  
	•	what would count as enough benefit to continue  
	•	what would trigger softening, shortening, or stopping  
  
No intervention should run as though it is guaranteed to be appropriate for the entire session.  
  
⸻  
  
11. Constraint-Based Selection Rule  
  
M4.5 should operate as a constraint-aware selector, not only as a preference chooser.  
  
The selector should read state outputs and link outputs as constraints such as:  
	•	avoid aggressive breathing  
	•	avoid long no-checkpoint sequences  
	•	avoid strong local focus first  
	•	keep effort low  
	•	downshift after worsening  
	•	keep exploration minimal under low confidence  
  
This is one of the core strengths of HARI.  
  
Often the most important decision is not what to do, but what not to do.  
  
⸻  
  
12. Compression-Sensitive Handling  
  
When Compression_Sensitivity is elevated, the selector should bias toward:  
	•	decompression-oriented choices  
	•	softer breathing mechanics  
	•	reduced bracing effort  
	•	earlier reassessment  
	•	avoiding strong inhale effort or forceful expansion framing  
  
The selector must not interpret compression sensitivity as proof of anatomical compression.  
  
This is a regulation constraint, not a diagnosis.  
  
⸻  
  
13. Guarding-Heavy Handling  
  
When Guarding_Load is elevated, the selector should bias toward:  
	•	reduced-effort breathing  
	•	less performance framing  
	•	simpler cues  
	•	broader relaxation framing  
	•	shorter sequences before feedback  
  
The system should avoid interventions that accidentally reward more trying, more fixing, or more bracing.  
  
⸻  
  
14. Flare-Sensitive Handling  
  
When Flare_Sensitivity_Estimate is elevated, the selector should strongly prefer:  
	•	lower intensity  
	•	shorter sequence length  
	•	higher reassessment urgency  
	•	lower explanatory ambition  
	•	immediate downshift if worsening appears  
  
Under high flare sensitivity, the selector should behave as though the session is easier to overdo.  
  
That must meaningfully change the intervention package.  
  
⸻  
  
15. Low Expansion Capacity Handling  
  
When Expansion_Capacity appears limited, the selector should avoid treating stronger expansion effort as the answer by default.  
  
Instead, it should consider:  
	•	softer access strategies  
	•	decompression-first approaches  
	•	reduced-effort breathing  
	•	slower pacing  
	•	more tolerance-building than performance-demanding sequences  
  
The selector must not confuse low current capacity with a command to push harder.  
  
⸻  
  
16. Session Intent Compatibility  
  
Intervention choice must remain compatible with session intent.  
  
Examples:  
	•	a quick reset should not expand into an unnecessarily long protocol  
	•	an exploratory session still must respect elevated flare sensitivity  
	•	a deeper regulation session may be allowed only if the current state actually supports it  
	•	a car recovery session may require subtle micro-reset logic rather than full formal pacing  
  
Session intent shapes the intervention package.  
It does not override safety.  
  
⸻  
  
17. Preference Compatibility  
  
Intervention choice may be influenced by:  
	•	general Body Context session-length preference  
	•	today’s session-length preference  
	•	quick reset vs deeper session preference  
  
However, preference must never override safety or current tolerance.  
  
Examples:  
	•	if the user generally prefers longer sessions but current tolerance is low, choose shorter  
	•	if the user wants a longer session today but worsening appears early, shorten or downshift  
  
Preference is a modifier, not the deciding truth.  
  
⸻  
  
18. Link Map Compatibility  
  
M4.5 should use M4.4 outputs to decide whether the intervention should be:  
	•	more local vs more global  
	•	more decompression-oriented vs more expansion-oriented  
	•	more cautionary vs more exploratory  
	•	more distributed vs more targeted  
  
Examples:  
	•	if the current pattern appears broader than isolated, avoid pushing only one local target  
	•	if guarding distribution links are supported, soften the whole strategy  
	•	if posture/context links are strong, adapt the intervention to that context  
  
Links should shape intervention framing, not become causal claims.  
  
⸻  
  
19. Confidence Handling Rule  
  
Confidence_Level from M4.3 must constrain intervention ambition.  
  
When confidence is lower, the selector must prefer:  
	•	simpler intervention classes  
	•	lower intensity  
	•	shorter sequences  
	•	earlier reassessment  
	•	fewer explanatory claims  
  
When confidence is higher, the selector may be slightly more tailored, but it must still remain conservative.  
  
Higher confidence is not permission for aggressive progression.  
  
⸻  
  
20. Stop / Pause Capability  
  
The Intervention Selector must support non-progression outcomes.  
  
It must be able to choose:  
	•	pause  
	•	simplify  
n- stop session recommendation  
	•	switch to minimal micro-reset  
  
when the current session indicates that continuing the present strategy is not appropriate.  
  
This is required behavior, not an edge case.  
  
The selector must not trap the session in forward motion.  
  
⸻  
  
21. Worsening Response Rule  
  
If reassessment shows worsening, the selector must not intensify in response.  
  
Instead it should generally:  
	•	downshift intensity  
	•	shorten the next step  
	•	simplify the intervention  
	•	reduce performance demand  
	•	consider pause or stop  
  
The system must never behave like worsening means the user needs to push through harder.  
  
⸻  
  
22. Session Improvement Rule  
  
If reassessment shows improvement, the selector may:  
	•	continue the current intervention briefly  
	•	cautiously extend the sequence  
	•	maintain the same level before adding complexity  
  
Improvement is not permission for immediate escalation.  
  
The preferred progression is:  
	•	confirm stability first  
	•	extend modestly if appropriate  
	•	keep the next reassessment active  
  
⸻  
  
23. Mixed or Unclear Response Rule  
  
If response is mixed or unclear, the selector should bias toward:  
	•	simplification  
	•	shorter follow-up test sequences  
	•	softer framing  
	•	reducing interpretive confidence  
	•	faster reassessment  
  
Ambiguous response should not be treated like success.  
  
⸻  
  
24. Intervention Package Shape  
  
The Intervention Selector must produce structured outputs.  
  
Suggested output fields:  
	•	Intervention_Class  
	•	Immediate_Objective  
	•	Softness_Level  
	•	Sequence_Length_or_Round_Count  
	•	Reassessment_Timing  
	•	Active_Constraints  
	•	Adaptation_Reasoning  
	•	Escalation_Permission_or_Limits  
  
Example:  
	•	Intervention_Class: Soft Decompression Breathing  
	•	Immediate_Objective: reduce guarding and lower compression-sensitive effort  
	•	Softness_Level: high  
	•	Sequence_Length_or_Round_Count: short  
	•	Reassessment_Timing: early  
	•	Active_Constraints: avoid forceful inhale effort, avoid long uninterrupted pacing  
	•	Adaptation_Reasoning: elevated guarding load + high flare sensitivity + sitting context  
	•	Escalation_Permission_or_Limits: no escalation until clear improvement  
  
This structure is strongly preferred.  
  
⸻  
  
25. Explainability Rule  
  
M4.5 must support clear user-facing explanation such as:  
  
“Because today’s session appears more flare-sensitive and braced, we’re starting with a softer, shorter decompression-focused sequence instead of a deeper guided cycle. We’ll check in early and only continue if it feels better.”  
  
This explanation must remain:  
	•	non-diagnostic  
	•	current-session-focused  
	•	practical  
	•	calm  
	•	conservative  
  
The system must never use intervention explanation as a way to smuggle in unsupported anatomy claims.  
  
⸻  
  
26. No Fixed-Protocol Trap Rule  
  
The Intervention Selector must not force all users through the same sequence regardless of state.  
  
It must be capable of choosing:  
	•	shorter vs longer  
	•	softer vs standard  
	•	global vs more targeted  
	•	continue vs simplify vs stop  
  
This is one of the key reasons HARI exists.  
  
State should meaningfully change the decision package.  
  
⸻  
  
27. Current Session First Rule  
  
The selector must remain current-session-first.  
  
Even if past sessions suggest a certain intervention often helps, M4.5 must still obey:  
	•	current tolerance  
	•	current flare sensitivity  
	•	current response trend  
	•	current confidence level  
  
Historical usefulness can personalize a choice.  
It cannot force a choice against present evidence.  
  
⸻  
  
28. Invalid Session Compatibility  
  
If a session is later invalidated or deleted within the supported rollback window, its intervention decisions must not contribute to long-term adaptive memory progression.  
  
M4.5 is session-operational first.  
Any broader learning influence depends on later validation and retention layers.  
  
⸻  
  
29. Failure Modes to Prevent  
  
The implementation must actively guard against the following:  
  
Failure Mode A — more-is-better bias  
  
The selector assumes deeper, longer, or stronger is superior.  
  
Failure Mode B — confidence misuse  
  
The selector treats higher support as permission to be aggressive.  
  
Failure Mode C — preference domination  
  
User preference overrides actual session safety.  
  
Failure Mode D — fixed protocol rigidity  
  
The selector behaves like HARI does not exist.  
  
Failure Mode E — forward-only momentum  
  
The session cannot pause, simplify, or stop.  
  
Failure Mode F — explanation overreach  
  
The selector justifies its choice with unsupported causal claims.  
  
All six must be prevented.  
  
⸻  
  
30. Implementation Boundaries  
  
M4.5 implements:  
	•	the intervention-decision layer  
	•	session-matched intervention class selection  
	•	current-state-aware pacing and length selection  
	•	reassessment timing selection  
	•	safety constraints for the next step  
	•	structured intervention decision packages  
  
M4.5 does not implement:  
	•	the runtime breathing animation itself  
	•	long-term learning compaction  
	•	session archival design  
	•	persistent history mutation  
	•	medical diagnosis  
  
Those belong to other layers.  
  
⸻  
  
31. Final Instruction to Claude Code  
  
Implement M4.5 as the Intervention Selector for HARI.  
  
Your implementation must:  
	•	choose the safest, most appropriate next breath-led response for the current session  
	•	remain current-session-first and confidence-constrained  
	•	treat softness, pacing, and reassessment timing as core decisions, not secondary details  
	•	support pause, simplify, and stop outcomes when needed  
	•	produce structured intervention packages rather than vague narrative recommendations  
	•	stay conservative, non-diagnostic, and explainable  
  
Do not build a progression machine.  
Do not reward effort when the state calls for downshifting.  
Do not trap the user inside fixed long sequences.  
  
This layer must turn HARI’s reasoning into practical session behavior without losing safety or flexibility. # onelong md   
