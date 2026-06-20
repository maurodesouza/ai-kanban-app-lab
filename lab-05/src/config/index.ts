/**
 * Global application configuration.
 */

type Environment = 'development' | 'production' | 'test';

function getEnvironment(): Environment {
  if (typeof import.meta.env !== 'undefined') {
    return import.meta.env.DEV ? 'development' : 'production';
  }

  return 'production';
}

export const config = {
  envs: {
    environment: getEnvironment(),
  },
};
