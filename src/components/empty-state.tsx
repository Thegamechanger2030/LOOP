export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-16 border border-dashed border-gray-300 rounded-xl">
      <p className="font-medium text-gray-700">{title}</p>
      <p className="text-sm text-gray-400 mt-1">{description}</p>
    </div>
  );
}
