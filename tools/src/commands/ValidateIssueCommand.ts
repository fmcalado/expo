import { Command } from '@expo/commander';

import { getIssueAsync } from '../GitHub';
import logger from '../Logger';

type ActionOptions = {
  issue: string;
};

export default (program: Command) => {
  program
    .command('validate-issue')
    .alias('vi')
    .description('Verifies whether a GitHub issue is valid.')
    .option('-i, --issue <string>', 'ID of the issue to validate.')
    .asyncAction(action);
};

async function action(options: ActionOptions) {
  if (isNaN(Number(options.issue))) {
    throw new Error('Flag `--issue` must be provided with a number value.');
  }
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('Environment variable `GITHUB_TOKEN` is required for this command.');
  }
  try {
    await validateIssueAsync(+options.issue);
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

const REPRO_URI_REGEXES = [
  /github\.com/,
  /gitlab\.com/,
  /bitbucket\.org/,
  /snack\.expo\.(dev|io)\//,
];

async function validateIssueAsync(issueId: number) {
  const issue = await getIssueAsync(issueId);
  if (!issue) {
    throw new Error(`Issue #${issueId} does not exist.`);
  }

  // Maybe actually match the full URL and print it?
  const matches = REPRO_URI_REGEXES.map((regex) =>
    (issue.body?.toLowerCase() ?? '').match(regex)
  ).filter(Boolean);

  const includesReproUri = matches.length > 0;

  if (includesReproUri) {
    console.log('Issue includes a repro URI.');
  } else {
    console.log('No repro! Close it!');
  }
}
