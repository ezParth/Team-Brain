interface Props {
    results: string;
  }
  
  export default function Results({ results }: Props) {
    return (
      <div className="mt-4 p-4 bg-gray-800 rounded min-h-[100px]">
        {results ? results : "No results yet."}
      </div>
    );
  }
  