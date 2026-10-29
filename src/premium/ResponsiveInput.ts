/**
 * NAMELESS 404 — controlador de entrada de baja latencia.
 * No depende de DOM ni de un FPS concreto: las pulsaciones son inmediatas;
 * las repeticiones, una por intervalo; liberar siempre detiene la acción.
 */
export const INPUT_FIRST_REPEAT_MS = 185;
export const INPUT_REPEAT_MS = 92;

export type InputAction = 'ArrowUp'|'ArrowDown'|'ArrowLeft'|'ArrowRight'|'interact'|'swap'|'light'|'sneak'|'decoy'|'map';
export const INPUT_DIRECTIONS: ReadonlySet<string> = new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
interface Held { action: InputAction; nextAt: number; }
export class ResponsiveInput {
  private held = new Map<string,Held>();
  press(source: string, action: InputAction, now: number): InputAction | null {
    const current=this.held.get(source);
    if(current?.action===action)return null; // ignorar repeticiones del SO y del DOM
    this.held.set(source,{action,nextAt:now+INPUT_FIRST_REPEAT_MS});
    return action; // pulsación inicial sin bloqueo global
  }
  release(source: string): void {this.held.delete(source);}
  clear(): void {this.held.clear();}
  /** Todos los dispositivos usan exactamente la misma cadencia sostenida. */
  repeat(now: number): InputAction[] {
    const result:InputAction[]=[];
    for(const held of this.held.values()){
      if(INPUT_DIRECTIONS.has(held.action)&&now>=held.nextAt){
        result.push(held.action);
        held.nextAt=now+INPUT_REPEAT_MS; // no acumular acciones si se bloquea un fotograma
      }
    }
    return result;
  }
  get activeCount(): number {return this.held.size;}
}
