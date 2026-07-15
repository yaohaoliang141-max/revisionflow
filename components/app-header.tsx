"use client";
import { Github, LockKeyhole } from "lucide-react";
export function AppHeader({onPrivacy}:{onPrivacy:()=>void}){return <header className="header"><div className="header-left"><div className="brand">Revision<span>Flow</span></div><span className="tagline">Feedback to focused revision plans.</span></div><div style={{display:"flex",gap:8}}><button className="btn small" onClick={onPrivacy}><LockKeyhole size={14}/> Privacy</button><a className="btn small" href="https://github.com" target="_blank" rel="noreferrer"><Github size={14}/> GitHub</a></div></header>}
