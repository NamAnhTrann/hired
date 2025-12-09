export class Optimistic {

  static apply<T>(
    stateUpdate: () => void,               
    backendCall: () => any,                 
    rollback: () => void                  
  ) {
    // apply UI first
    stateUpdate();

    // then call backend
    backendCall().subscribe({
      next: () => {},
      error: () => rollback()
    });
  }

}
