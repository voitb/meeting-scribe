import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TermsOfService() {
	return (
		<ScrollArea className="h-screen">
			<main className="min-h-screen bg-background">
				<Navbar />

				<div className="container mx-auto px-3 sm:px-6 pt-8 pb-12">
					<div className="max-w-4xl mx-auto">
						<h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
							<p className="text-muted-foreground mb-4">
								MeetingScribe is an open-source application available under the
								MIT license, created for a Next.js Hackathon. The project
								initially started as a YouTube video analysis tool, but due to
								copyright and legal concerns, it was transformed into a meeting
								analysis application focused on user-uploaded content.
							</p>
							<p className="text-muted-foreground">
								By using MeetingScribe, you accept these terms. Please read them
								carefully before you start using our application.
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold mb-4">
								2. Scope of Services
							</h2>
							<p className="text-muted-foreground mb-4">
								MeetingScribe enables audio and video file analysis, generating:
							</p>
							<ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
								<li>Comprehensive summaries</li>
								<li>Key points extraction</li>
								<li>Video chapter detection</li>
								<li>Action items detection</li>
							</ul>
							<p className="text-muted-foreground">
								The service supports various media formats, including audio
								files (MP3, WAV, OGG, M4A, WEBM) and video files (MP4, MKV,
								WEBM, MOV).
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold mb-4">
								3. Privacy and Security
							</h2>
							<p className="text-muted-foreground mb-4">
								MeetingScribe provides:
							</p>
							<ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
								<li>User authentication via Clerk</li>
								<li>Secure data storage with Convex</li>
								<li>Temporary file handling</li>
							</ul>
							<p className="text-muted-foreground">
								Uploaded files are processed solely for analysis purposes and
								are not shared with third parties. Data is stored only for the
								time necessary to conduct the analysis, unless the user is
								logged in – in which case the analysis results are saved in the
								history.
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold mb-4">
								4. Intellectual Property Rights
							</h2>
							<p className="text-muted-foreground mb-4">
								MeetingScribe is available under the MIT license. This means
								that:
							</p>
							<ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
								<li>You can freely use, modify, and distribute the software</li>
								<li>The source code is publicly available</li>
								<li>The license imposes minimal restrictions on reuse</li>
							</ul>
							<p className="text-muted-foreground">
								Content uploaded by users remains their property. MeetingScribe
								does not claim ownership of uploaded files or analysis results.
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold mb-4">
								5. Limitation of Liability
							</h2>
							<p className="text-muted-foreground mb-4">
								MeetingScribe is provided &ldquo;as is&rdquo;, without any
								warranties, express or implied. We do not guarantee that:
							</p>
							<ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
								<li>The service will always be available or uninterrupted</li>
								<li>Analyses will be completely accurate</li>
								<li>All file formats will be supported in all circumstances</li>
							</ul>
							<p className="text-muted-foreground">
								Under no circumstances shall the creators or contributors of
								MeetingScribe be liable for any damages resulting from the use
								or inability to use the software.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold mb-4">6. Contact</h2>
							<p className="text-muted-foreground">
								If you have questions about these terms or want to report an
								issue, contact us through the project&apos;s GitHub repository
								or send a message using the links in the footer.
							</p>
						</section>
					</div>
				</div>

				<Footer />
			</main>
		</ScrollArea>
	);
}
