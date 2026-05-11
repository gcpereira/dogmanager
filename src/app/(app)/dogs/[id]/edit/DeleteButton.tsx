"use client";

export default function DeleteButton({ dogName }: { dogName: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(`Tem certeza que deseja excluir "${dogName}"?`)) {
          e.preventDefault();
        }
      }}
      className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-lg py-2 text-sm transition"
    >
      Excluir cachorro
    </button>
  );
}
