// Port web du moteur FMJD 10x10 du projet Kotlin JEAN FRANK.
export const dirs=[[-1,-1],[-1,1],[1,-1],[1,1]];
export const rc=s=>{if(s<1||s>50)throw Error('Case invalide');let r=Math.floor((s-1)/5),i=(s-1)%5;return [r,i*2+(r%2===0?1:0)]};
export const sq=(r,c)=>r<0||r>9||c<0||c>9||(r+c)%2===0?null:r*5+Math.floor(c/2)+1;
export function initial(){let b={};for(let i=1;i<=20;i++)b[i]='b';for(let i=31;i<=50;i++)b[i]='w';return {board:b,turn:'w',history:[],result:null,kingOnly:0};}
function captures(state,from,piece){let out=[],base={...state.board};delete base[from];
 const walk=(at,path,taken)=>{let [r,c]=rc(at),extended=false;
 for(const [dr,dc] of dirs){let step=1,enemy=null;
  while(true){let x=sq(r+dr*step,c+dc*step);if(!x)break;let p=base[x];if(p){if(p[0]===piece[0]||taken.includes(x))break;enemy=x;break;}if(piece==='w'||piece==='b')break;step++;}
  if(!enemy)continue;
  let [er,ec]=rc(enemy);let landStep=piece==='wk'||piece==='bk'?step+1:2;
  while(true){let dest=sq(r+dr*landStep,c+dc*landStep);if(!dest||base[dest])break;
   // For men, landing is exactly two diagonal steps; kings may land beyond victim.
   if(piece==='wk'||piece==='bk'||landStep===2){extended=true;walk(dest,[...path,dest],[...taken,enemy]);}
   if(piece==='w'||piece==='b')break;landStep++;
  }
 }
 if(!extended&&taken.length)out.push({from,to:at,path,captured:taken,promotes:(piece==='w'&&at<=5)||(piece==='b'&&at>=46)});
 };
 walk(from,[from],[]);return out;
}
export function legalMoves(st){if(st.result)return[];let caps=[];for(const [k,p] of Object.entries(st.board)){let from=+k;if(p[0]!==st.turn)continue;caps.push(...captures(st,from,p));}
 if(caps.length){let m=Math.max(...caps.map(x=>x.captured.length));return caps.filter(x=>x.captured.length===m);}
 let out=[];for(const [k,p] of Object.entries(st.board)){let from=+k;if(p[0]!==st.turn)continue;let [r,c]=rc(from);if(p[1]==='k'){for(const [dr,dc] of dirs){for(let n=1;;n++){let to=sq(r+dr*n,c+dc*n);if(!to||st.board[to])break;out.push({from,to,path:[from,to],captured:[],promotes:false});}}}else{let dr=p[0]==='w'?-1:1;for(let dc of [-1,1]){let to=sq(r+dr,c+dc);if(to&&!st.board[to])out.push({from,to,path:[from,to],captured:[],promotes:(p[0]==='w'&&to<=5)||(p[0]==='b'&&to>=46)});}}}return out;}
export function apply(st,m){let legal=legalMoves(st),x=legal.find(v=>v.from===m.from&&v.to===m.to&&JSON.stringify(v.path)===JSON.stringify(m.path));if(!x)throw Error('Coup illégal');let board={...st.board},p=board[x.from];delete board[x.from];x.captured.forEach(s=>delete board[s]);board[x.to]=x.promotes?p[0]+'k':p;let next={...st,board,turn:st.turn==='w'?'b':'w',history:[...st.history,x],kingOnly:p[1]==='k'&&!x.captured.length?st.kingOnly+1:0};let remain=legalMoves(next);if(!remain.length)next.result=st.turn==='w'?'Blanc gagne':'Noir gagne';return next;}
export const notation=m=>m.path.join(m.captured.length?'x':'-');
