import { catalog, presets } from "@/lib/catalog";
import Storefront from "@/components/Storefront";

export default function Home() { return <Storefront products={catalog} presets={presets} />; }
