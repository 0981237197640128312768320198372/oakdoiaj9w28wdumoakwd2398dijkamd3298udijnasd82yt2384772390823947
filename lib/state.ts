interface AsdState {
  status: 'running' | 'stopped';
  parameters?: string[];
}

interface OneTimeCommand {
  command: string;
}

let asdState: AsdState = { status: 'stopped' };
let oneTimeCommand: OneTimeCommand | null = null;

export function setAsdState(state: AsdState) {
  asdState = state;
}

export function getAsdState(): AsdState {
  return asdState;
}

export function setOneTimeCommand(command: OneTimeCommand) {
  oneTimeCommand = command;
}

export function getAndClearOneTimeCommand(): OneTimeCommand | null {
  const command = oneTimeCommand;
  oneTimeCommand = null;
  return command;
}
