export default function Reports() {
  return (
    <div className="space-y-xl pb-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl">
      <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface">Financial Reports</h1>
      <div className="flex items-center gap-md">

      <button className="h-[48px] px-md flex items-center gap-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">
      <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                          Last 30 Days
                          <span className="material-symbols-outlined text-[18px]">arrow_drop_down</span>
      </button>

      <button className="h-[48px] px-md flex items-center gap-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container transition-colors">
      <span className="material-symbols-outlined text-[18px]">download</span>
      <span className="hidden sm:inline">Export</span>
      </button>
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">

      <section className="md:col-span-8 bg-surface-container-lowest rounded-xl p-lg shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex flex-col h-[400px]">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-xl">Monthly Trend</h2>

      <div className="flex-grow flex items-end justify-between relative border-b border-outline-variant pb-sm">

      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-on-surface-variant font-label-sm text-label-sm pb-sm -ml-2">
      <span>$5k</span>
      <span>$2.5k</span>
      <span>$0</span>
      </div>

      <div className="flex flex-col items-center gap-sm w-1/6 z-10 ml-8">
      <div className="w-full max-w-[40px] bg-surface-container-high rounded-t-md h-[40%] hover:bg-primary-container transition-colors cursor-pointer relative group">
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">$2,100</div>
      </div>
      <span className="font-label-sm text-label-sm text-on-surface-variant">Jan</span>
      </div>
      <div className="flex flex-col items-center gap-sm w-1/6 z-10">
      <div className="w-full max-w-[40px] bg-surface-container-high rounded-t-md h-[55%] hover:bg-primary-container transition-colors cursor-pointer relative group">
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">$2,800</div>
      </div>
      <span className="font-label-sm text-label-sm text-on-surface-variant">Feb</span>
      </div>
      <div className="flex flex-col items-center gap-sm w-1/6 z-10">
      <div className="w-full max-w-[40px] bg-surface-container-high rounded-t-md h-[30%] hover:bg-primary-container transition-colors cursor-pointer relative group">
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">$1,500</div>
      </div>
      <span className="font-label-sm text-label-sm text-on-surface-variant">Mar</span>
      </div>
      <div className="flex flex-col items-center gap-sm w-1/6 z-10">
      <div className="w-full max-w-[40px] bg-primary rounded-t-md h-[80%] hover:bg-primary-container transition-colors cursor-pointer relative group shadow-sm">
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">$4,200</div>
      </div>
      <span className="font-label-sm text-label-sm text-on-surface font-bold">Apr</span>
      </div>
      <div className="flex flex-col items-center gap-sm w-1/6 z-10">
      <div className="w-full max-w-[40px] bg-surface-container-high rounded-t-md h-[60%] hover:bg-primary-container transition-colors cursor-pointer relative group">
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">$3,100</div>
      </div>
      <span className="font-label-sm text-label-sm text-on-surface-variant">May</span>
      </div>
      <div className="flex flex-col items-center gap-sm w-1/6 z-10">
      <div className="w-full max-w-[40px] bg-surface-container-high rounded-t-md h-[45%] hover:bg-primary-container transition-colors cursor-pointer relative group">
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">$2,300</div>
      </div>
      <span className="font-label-sm text-label-sm text-on-surface-variant">Jun</span>
      </div>
      </div>
      </section>

      <section className="md:col-span-4 bg-surface-container-lowest rounded-xl p-lg shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex flex-col h-[400px]">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-lg">Category Breakdown</h2>
      <div className="flex-grow flex flex-col items-center justify-center">

      <div className="w-40 h-40 rounded-full relative mb-xl shadow-inner" style={{ background: "conic-gradient(#003ec7 0% 45%, #bf3003 45% 75%, #c3c5d9 75% 100%)" }}>

      <div className="absolute inset-[25%] bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm">
      <div className="text-center">
      <span className="block font-label-sm text-label-sm text-on-surface-variant">Total</span>
      <span className="block font-label-md text-label-md text-on-surface font-bold">$4,200</span>
      </div>
      </div>
      </div>

      <div className="w-full flex flex-col gap-sm">
      <div className="flex items-center justify-between font-label-sm text-label-sm">
      <div className="flex items-center gap-sm">
      <div className="w-3 h-3 rounded-full bg-primary"></div>
      <span className="text-on-surface">Housing</span>
      </div>
      <span className="text-on-surface-variant font-bold">45%</span>
      </div>
      <div className="flex items-center justify-between font-label-sm text-label-sm">
      <div className="flex items-center gap-sm">
      <div className="w-3 h-3 rounded-full bg-tertiary-container"></div>
      <span className="text-on-surface">Food &amp; Dining</span>
      </div>
      <span className="text-on-surface-variant font-bold">30%</span>
      </div>
      <div className="flex items-center justify-between font-label-sm text-label-sm">
      <div className="flex items-center gap-sm">
      <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
      <span className="text-on-surface">Transportation</span>
      </div>
      <span className="text-on-surface-variant font-bold">25%</span>
      </div>
      </div>
      </div>
      </section>
      </div>
    </div>
  )
}
