import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const modified = req.clone({
    withCredentials: true
  });

  return next(modified);
};