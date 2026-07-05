import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CategoryPage() {
  const { category, subcategory } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the unified products page with category filter
    if (category) {
      navigate(`/products?category=${category}`, { replace: true });
    } else {
      navigate("/products", { replace: true });
    }
  }, [category, subcategory, navigate]);

  return null;
}