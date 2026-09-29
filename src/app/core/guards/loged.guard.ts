import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const logedGuard: CanActivateFn = (route, state) => {
 
   const _Router = inject(Router); 
 
if(typeof localStorage !== 'undefined'){
   console.log("localStorage.getItem('usertoken')", localStorage.getItem('usertoken'));
  if(localStorage.getItem('usertoken') !== null){
   console.log("1");
     _Router.navigate(['/home']);
     return false 
   } 
   else{
         console.log("2-");
    return true;
   }
  }
  else{
    return true
 }
   
 
};
