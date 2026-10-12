import {useEffect,useState} from 'react';
import type {ReactNode} from 'react';
import PracticeSession from './PracticeSession';
import GameErrorBoundary from './GameErrorBoundary';
import {api} from '../api/client';

export default function GameAccess({game,children}:{game:any;children:ReactNode}){
 const [access,setAccess]=useState<any>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;setAccess(null);setError('');api(`/games/${game.slug}/access`).then(value=>{if(active)setAccess(value)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[game.slug,retry]);
 if(error)return <section className="panel"><h1>{game.name}</h1><p role="alert">{error}</p><button onClick={()=>setRetry(n=>n+1)}>Try again</button><a className="button secondary" href="/games">Browse games</a></section>;
 if(!access)return <section className="panel" role="status">Opening {game.name}…</section>;
 if(!access.available)return <section className="panel"><h1>{game.name}</h1><p>This game is temporarily unavailable. Please choose another game.</p><a className="button" href="/games">Browse games →</a></section>;
 if(!access.allowed)return <section className="panel"><span className="tag">PREMIUM GAME</span><h1>{game.name}</h1><p>Unlock this game or choose one of our free games.</p><div className="actions"><a className="button" href={access.signedIn?`/billing?game=${game.slug}`:'/login'}>{access.signedIn?'View access options':'Sign in to unlock'}</a><a className="button secondary" href="/games">Explore free games</a></div></section>;
 return <GameErrorBoundary>{location.pathname.startsWith('/play/')?<PracticeSession game={game.slug} accountId={access.accountId}>{children}</PracticeSession>:children}</GameErrorBoundary>;
}
