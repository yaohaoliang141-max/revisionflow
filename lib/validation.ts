import type { FeedbackSource, ProjectContext } from "./types";
export const MAX_FILES=10, MAX_FILE_BYTES=5*1024*1024, MAX_TOTAL_CHARS=80000;
export const nextFeedbackId=(sources:Pick<FeedbackSource,"id">[])=>`F${String(sources.reduce((max,s)=>Math.max(max,Number(s.id.slice(1))||0),0)+1).padStart(3,"0")}`;
export function totalFeedbackCharacters(sources:FeedbackSource[]){return sources.reduce((n,s)=>n+s.text.length,0)}
export function canAnalyse(project:ProjectContext,sources:FeedbackSource[],key:string,model:string){return Boolean(project.name.trim()&&sources.some(s=>s.text.trim())&&key.trim()&&model.trim()&&totalFeedbackCharacters(sources)<=MAX_TOTAL_CHARS)}
