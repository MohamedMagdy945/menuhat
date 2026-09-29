import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const _Router = inject(Router); 
  const _PLATFORM_ID = inject(PLATFORM_ID); 


  // 1 --------------------------------------------------------------------------------------------
  // PlatFormId id  -- isPlatFormBrowser (id) -- isPlatFormServer (id)
  if(isPlatformBrowser(_PLATFORM_ID)){
    if( localStorage.getItem('usertoken') !== null){
      return true
    } else{
      _Router.navigate(['/login']);
      return false;
    }
  }
  else {
    return false;
  }


  // 2 --------------------------------------------------------------------------------------------
  // if(typeof localStorage !== 'undefined')
  // {
  //   if( localStorage.getItem('usertoken') !== null){
  //     return true
  //   } else{
  //     _Router.navigate(['/login']);
  //     return false;
  //   } 
  // }
  // else{
  //   return false
  // }
};
