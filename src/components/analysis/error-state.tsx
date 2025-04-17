import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorStateProps {
	error?: string;
}

export function ErrorState({ error }: ErrorStateProps) {
	const router = useRouter();

	return (
		<Card className="mb-8 border-destructive shadow-md">
			<CardContent className="pt-6 p-8">
				<h2 className="text-xl font-semibold text-destructive mb-4 text-center">
					An error occurred
				</h2>
				<p className="text-center text-muted-foreground mb-6">{error}</p>
				<div className="flex justify-center">
					<Button
						onClick={() => router.push("/")}
						variant="outline"
						className="flex items-center"
					>
						<Home className="w-4 h-4 mr-2" />
						Return to Home
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
