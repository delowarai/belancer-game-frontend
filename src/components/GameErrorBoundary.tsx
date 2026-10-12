import {Component} from 'react';
import type {ReactNode} from 'react';
export default class GameErrorBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true}}
 render(){return this.state.failed?<section className="panel"><h1>The game could not start.</h1><p>Please reload and try again. Your account purchases and saved progress remain available.</p><div className="actions"><button onClick={()=>location.reload()}>Reload game</button><a className="button secondary" href="/games">Choose another game</a></div></section>:this.props.children}
}
