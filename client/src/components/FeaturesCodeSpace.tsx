export const FeaturesCodeSpace = () => {
    return (
        <div className="col-span-3 row-span-1 rounded-2xl relative overflow-hidden group border">
            <div className="absolute h-full w-full object-cover rounded-2xl scale-[1.0] group-hover:scale-[1.2] group-hover:translate-x-[5%] group-hover:translate-y-[5%] transition-all duration-200">
                <img src="/cp_snippet.png"/>
            </div>
            <div className="absolute inset-0 bg-gray-950/30"/>
            <div className="absolute bottom-[4%] right-[2%] text-slate-300 text-lg font-semibold group-hover:text-[20px] transition-all duration-200">
                File manager, VS Code powering editor, multiple terminals and many more.
            </div>
        </div>
    )
}