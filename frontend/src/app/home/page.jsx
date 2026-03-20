import HomePageClient from "@/components/home/HomePageClient";

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const recordType = params?.type === "pitcher" ? "pitcher" : "batter";
  const currentYear = new Date().getFullYear();

  return <HomePageClient recordType={recordType} currentYear={currentYear} />;
}
