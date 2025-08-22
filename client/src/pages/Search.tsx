import AdvancedSearch from "@/components/AdvancedSearch";

export default function Search() {
  return (
    <div className="py-20 bg-white" data-testid="search-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="page-title">
            Advanced Search
          </h1>
          <p className="text-xl text-gray-600">
            Find projects, news, events, gallery images, and members
          </p>
        </div>
        
        <AdvancedSearch />
      </div>
    </div>
  );
}