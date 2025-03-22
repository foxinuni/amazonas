#ifndef AMAZONS_PRAGMA_H
#define AMAZONS_PRAGMA_H

#include <stdio.h>

/* 
 * This file just contains some macros used around the whole program.
 */

#ifdef DEBUG
#define debug(fmt, ...) printf(fmt, ##__VA_ARGS__)
#else
#define debug(fmt, ...) (void)0
#endif

#define arr_len(a) (sizeof(a) / sizeof(a[0]))
#define assert(cond) if (!(cond)) __builtin_trap()
#define assert_m(cond, msg) if (!(cond)) { fprintf(stderr, msg); __builtin_trap(); }

#endif