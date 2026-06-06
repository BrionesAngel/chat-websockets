import { Component } from "@angular/core";
import { LucideArrowLeftToLine  } from "@lucide/angular";

@Component({
  selector: 'back-button',
  standalone: true,
  imports: [ LucideArrowLeftToLine],
  template: `
    <div class="flex justify-center p-2 text-white font-medium max-w-2/12 rounded-2xl shadow-sm bg-linear-to-r from-violet-500 via-fuchsia-500 to-pink-500 gap-2 cursor-pointer">
      <svg lucideArrowLeftToLine></svg>
      <span>go Back</span>
    </div>
  `
})

export class BackButtonComponent{

}
