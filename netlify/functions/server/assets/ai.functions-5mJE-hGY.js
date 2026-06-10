import{T as l,c as n}from"./server-BIvcV76n.js";import{generateText as m}from"ai";import{z as t}from"zod";import{g as d}from"./ai-gateway.server-DmREUuNb.js";import"node:async_hooks";import"h3-v2";import"@tanstack/router-core";import"seroval";import"@tanstack/history";import"@tanstack/router-core/ssr/client";import"@tanstack/router-core/ssr/server";import"react";import"@tanstack/react-router";import"react/jsx-runtime";import"@tanstack/react-router/ssr/server";import"@ai-sdk/openai-compatible";var i=(e,r)=>{const o="/_serverFn/"+e.id;return Object.assign(r,{url:o,serverFnMeta:e,[l]:!0})};async function a(e,r){const o=d(),s=process.env.AI_MODEL??"gpt-4o-mini",{text:c}=await m({model:o(s),system:e,prompt:r});return{text:c}}const u=t.object({topic:t.string().min(2).max(2e3),tone:t.enum(["formal","informal","persuasive"]),audience:t.enum(["client","manager","team"]),context:t.string().max(2e3).optional(),recipient:t.string().max(500).optional(),subject:t.string().max(500).optional()}),p=i({id:"ea2d1b1dd13dc8c43c862d94309ced557cbedcf63fbfaaa905d3f97f35ab4ebb",name:"generateEmail",filename:"src/lib/ai.functions.ts"},e=>f.__executeServer(e)),f=n({method:"POST"}).inputValidator(e=>u.parse(e)).handler(p,async({data:e})=>a(`You are an executive communications writer for Operiq AI. Draft a polished business email.
Constraints:
- Tone: ${e.tone}.
- Audience: ${e.audience}.
${e.recipient?`- Recipient: ${e.recipient}.`:""}
${e.subject?`- Subject line hint: ${e.subject}.`:""}
- Include a clear subject line on the first line as "Subject: ...".
- If a recipient was provided, address them appropriately in the salutation.
- Concise, professional, no filler. Avoid emoji.
- Use markdown.
- Ensure the email is contextually appropriate for the audience and tone specified.`,`Email purpose: ${e.topic}

Additional context: ${e.context??"none"}`)),h=t.object({notes:t.string().min(20).max(2e4),meetingType:t.enum(["1:1","team-sync","client-call","all-hands"]).optional()}),b=i({id:"4112b9b3dc0201c3af5b264b1532d8fb76ccc93ee1c5b22802b5e61b19e6a9f7",name:"summarizeMeeting",filename:"src/lib/ai.functions.ts"},e=>g.__executeServer(e)),g=n({method:"POST"}).inputValidator(e=>h.parse(e)).handler(b,async({data:e})=>a(`You analyze raw meeting notes/transcripts and produce a clear executive briefing.
Meeting type: ${e.meetingType??"general"}. Return markdown with exactly these sections in this order:
## Summary
A 3-5 sentence neutral synopsis.
## Key Decisions
Bulleted list of decisions made.
## Action Items
Bulleted list — each line: **Owner** — task — due date (if mentioned).
## Deadlines
Bulleted list of dates and what is due.
If a section has nothing, write "_None identified_".
Be thorough and accurate. Flag any ambiguous points.`,e.notes)),y=t.object({horizon:t.enum(["daily","weekly"]),tasks:t.string().min(5).max(5e3),goals:t.string().max(1e3).optional()}),v=i({id:"c6efe13605c8770b801459fa788e0d9d81e05b4eff916660653565f4bc993d55",name:"planTasks",filename:"src/lib/ai.functions.ts"},e=>x.__executeServer(e)),x=n({method:"POST"}).inputValidator(e=>y.parse(e)).handler(v,async({data:e})=>a(`You are an executive productivity coach. Build a prioritized ${e.horizon} plan.
Return markdown with:
## Prioritized Plan
A numbered schedule (with suggested time blocks for daily; day-by-day for weekly).
Mark each item P1 / P2 / P3.
## Rationale
Briefly explain prioritization (Eisenhower / impact-effort lens).
## Productivity Suggestions
3 concrete improvements tailored to the workload.
Consider dependencies between tasks and energy levels.`,`Tasks:
${e.tasks}

Goals/Context: ${e.goals??"none"}`)),S=t.object({material:t.string().min(20).max(2e4),question:t.string().max(1e3).optional(),depth:t.enum(["quick","deep","executive"]).optional()}),_=i({id:"28a3d3c9b58d44644a4bbc0f2ca61587ba2016ced80556110e3dac1c593a557d",name:"analyzeResearch",filename:"src/lib/ai.functions.ts"},e=>w.__executeServer(e)),w=n({method:"POST"}).inputValidator(e=>S.parse(e)).handler(_,async({data:e})=>a(`You are a senior research analyst. Distill the provided material.
Analysis depth: ${e.depth??"deep"}. Return markdown with:
## Executive Summary
3-5 sentences.
## Key Insights
Bulleted list of the most important findings.
## Recommendations
Numbered, actionable, written for decision-makers.
## Open Questions
Bulleted list of gaps or items needing verification.
Be objective. Flag potential biases in the source material.`,`Material:
${e.material}

Focus question: ${e.question??"general analysis"}`));export{_ as analyzeResearch_createServerFn_handler,p as generateEmail_createServerFn_handler,v as planTasks_createServerFn_handler,b as summarizeMeeting_createServerFn_handler};
