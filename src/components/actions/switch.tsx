export default function Switch() {
  return (
    <div className="ml-4 flex items-center">
      <label
        htmlFor={`job-alert-${"aded"}`}
        className="inline-flex items-center cursor-pointer"
        // Prevent label click from triggering link navigation
        onClick={(e) => e.stopPropagation()}
      >
        <input
          className="sr-only peer"
        />
        <div
          className="
                          w-11 h-6 
                          bg-gray-300 peer-checked:bg-[#14A800] 
                          rounded-full 
                          peer 
                          relative 
                          after:content-[''] 
                          after:absolute 
                          after:top-0.5 
                          after:left-[2px] 
                          after:bg-white 
                          after:rounded-full 
                          after:h-5 
                          after:w-5 
                          after:transition-all 
                          peer-checked:after:translate-x-full
                        "
        />
      </label>
    </div>
  );
}
