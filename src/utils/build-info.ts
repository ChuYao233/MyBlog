import { execSync } from "child_process";

/**
 * 获取构建信息
 */
export function getBuildInfo() {
	let commitHash = "";
	let buildTime = new Date().toISOString();

	// 优先从环境变量获取（适用于 CI/CD 环境）
	if (import.meta.env.PUBLIC_COMMIT_HASH) {
		commitHash = import.meta.env.PUBLIC_COMMIT_HASH;
	} else {
		// 尝试通过 git 命令获取
		try {
			commitHash = execSync("git rev-parse --short HEAD", {
				encoding: "utf-8",
				stdio: ["ignore", "pipe", "ignore"],
			}).trim();
		} catch (error) {
			// 如果 git 命令失败，保持为空
			commitHash = "";
		}
	}

	// 优先从环境变量获取构建时间（适用于 CI/CD 环境）
	if (import.meta.env.PUBLIC_BUILD_TIME) {
		buildTime = import.meta.env.PUBLIC_BUILD_TIME;
	}

	return {
		commitHash,
		buildTime,
	};
}

