import HomePageClient from "@/components/home/HomePageClient";

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const selectedScope = params?.scope === "career" ? "career" : "season";

  return <HomePageClient selectedScope={selectedScope} />;
}
